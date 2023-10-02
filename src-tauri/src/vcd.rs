use std::{collections::HashMap, str::FromStr};

use lazy_static::lazy_static;
use regex::Regex;
use serde::Serialize;

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct VCDFile {
    variables: VariableScope,
    timescale: (u32, String),
    version: String,
    date: String,
    timeline: HashMap<char, HashMap<u32, String>>,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct VariableScope {
    name: Option<String>,
    ty: Option<String>,
    variables: Vec<Variable>,
    scopes: Vec<VariableScope>,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Variable {
    ty: String,
    size: u32,
    identifier: char,
    reference: String,
}

/// Parses the $timescale instruction. Returns:
/// - Ok(Some) if successful.
/// - Ok(None) if it is not a $timescale instruction.
/// - Err(()) if this is a malformatted $timescale instruction.
fn parse_timescale(s: &str) -> Result<Option<(&str, u32, String)>, ()> {
    lazy_static! {
        static ref REGEX: Regex =
            Regex::new("^\\$timescale (\\d+) (s|ms|us|ns|ps|fs) \\$end").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Ok(Some((
            s.strip_prefix(&cap[0]).unwrap(),
            cap[1].parse().map_err(|_| ())?,
            cap[2].to_owned(),
        )))
    } else {
        Ok(None)
    }
}

/// Parses the $comment instruction.
fn parse_comment(s: &str) -> Option<&str> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$comment (\\s|\\S)+ \\$end").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Some(s.strip_prefix(&cap[0]).unwrap())
    } else {
        None
    }
}

/// Parses the $date instruction.
fn parse_date(s: &str) -> Option<(&str, String)> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$date (.+?) \\$end").unwrap();
    }

    REGEX
        .captures(s)
        .map(|cap| (s.strip_prefix(&cap[0]).unwrap(), cap[1].to_owned()))
}

/// Parses the $version instruction.
fn parse_version(s: &str) -> Option<(&str, String)> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$version (.+?) \\$end").unwrap();
    }

    REGEX
        .captures(s)
        .map(|cap| (s.strip_prefix(&cap[0]).unwrap(), cap[1].to_owned()))
}

/// Parses the $var instruction. Returns:
/// - Ok(Some) if successful.
/// - Ok(None) if it is not a $timescale instruction.
/// - Err(()) if this is a malformatted $timescale instruction.
fn parse_variable(s: &str) -> Result<Option<(&str, Variable)>, ()> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$var (event|integer|parameter|real|reg|supply0|supply1|time|tri|triand|trior|trireg|tri0|tri1|wand|wire|wor) (\\d+) (.) (.*?) \\$end").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Ok(Some((
            s.strip_prefix(&cap[0]).unwrap(),
            Variable {
                ty: cap[1].to_owned(),
                size: cap[2].parse().map_err(|_| ())?,
                identifier: cap[3].chars().next().ok_or(())?,
                reference: cap[4].to_owned(),
            },
        )))
    } else {
        Ok(None)
    }
}

/// Parses the $scope instruction.
fn parse_scope(s: &str) -> Option<(&str, String, String)> {
    lazy_static! {
        static ref REGEX: Regex =
            Regex::new("^\\$scope (begin|fork|function|module|task) (.+?) \\$end").unwrap();
    }

    REGEX.captures(s).map(|cap| {
        (
            s.strip_prefix(&cap[0]).unwrap(),
            cap[1].to_owned(),
            cap[2].to_owned(),
        )
    })
}

fn parse_enddefinitions(s: &str) -> Option<&str> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$enddefinitions \\$end").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Some(s.strip_prefix(&cap[0]).unwrap())
    } else {
        None
    }
}

fn parse_timestamp(s: &str) -> Result<Option<(&str, u32)>, ()> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^#(\\d+)\n").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Ok(Some((
            s.strip_prefix(&cap[0]).unwrap(),
            cap[1].parse().map_err(|_| ())?,
        )))
    } else {
        Ok(None)
    }
}

fn parse_value_change(s: &str) -> Result<Option<(&str, String, char)>, ()> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^(?:(.)(.)|(.+?) (.))\n").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Ok(Some((
            s.strip_prefix(&cap[0]).unwrap(),
            cap.get(1).or(cap.get(3)).unwrap().as_str().to_owned(),
            cap.get(2)
                .or(cap.get(4))
                .unwrap()
                .as_str()
                .chars()
                .next()
                .ok_or(())?,
        )))
    } else {
        Ok(None)
    }
}

/// Parses the $upscope instruction.
fn parse_upscope(s: &str) -> Option<&str> {
    lazy_static! {
        static ref REGEX: Regex = Regex::new("^\\$upscope \\$end").unwrap();
    }

    if let Some(cap) = REGEX.captures(s) {
        Some(s.strip_prefix(&cap[0]).unwrap())
    } else {
        None
    }
}

impl FromStr for VCDFile {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut s = s;

        let mut timescale = None;
        let mut date = None;
        let mut version = None;
        let mut timeline: HashMap<char, HashMap<u32, String>> = Default::default();

        let mut scopes = vec![VariableScope {
            name: None,
            ty: None,
            ..Default::default()
        }];

        while !s.is_empty() {
            s = s.trim_start();

            if let Some(r) = parse_date(s) {
                s = r.0;
                date = Some(r.1);
            } else if let Some(r) = parse_version(s) {
                s = r.0;
                version = Some(r.1);
            } else if let Some(r) = parse_timescale(s)? {
                timescale = Some((r.1, r.2));
                s = r.0;
            } else if let Some(r) = parse_comment(s) {
                s = r;
            } else if let Some(r) = parse_scope(s) {
                s = r.0;
                scopes.push(VariableScope {
                    name: Some(r.2),
                    ty: Some(r.1),
                    ..Default::default()
                });
            } else if let Some(r) = parse_upscope(s) {
                s = r;
                let head = scopes.pop().ok_or(())?;
                scopes.last_mut().ok_or(())?.scopes.push(head);
            } else if let Some(r) = parse_variable(s)? {
                s = r.0;
                scopes.last_mut().ok_or(())?.variables.push(r.1);
            } else if let Some(r) = parse_enddefinitions(s) {
                s = r;

                let mut time = 0;
                while !s.is_empty() {
                    s = s.trim_start();

                    if let Some(r) = parse_timestamp(s)? {
                        s = r.0;
                        time = r.1;
                    } else if let Some(r) = parse_value_change(s)? {
                        match timeline.entry(r.2) {
                            std::collections::hash_map::Entry::Occupied(mut entry) => {
                                entry.get_mut().insert(time, r.1);
                            }
                            std::collections::hash_map::Entry::Vacant(entry) => {
                                let mut m: HashMap<u32, String> = Default::default();
                                m.insert(time, r.1);
                                entry.insert(m);
                            }
                        }
                        s = r.0;
                    } else {
                        return Err(());
                    }
                }
            } else {
                return Err(());
            }
        }

        let head = scopes.pop().ok_or(())?;
        Ok(VCDFile {
            variables: head,
            timescale: timescale.ok_or(())?,
            version: version.ok_or(())?,
            date: date.ok_or(())?,
            timeline,
        })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn timescale() {
        let res = parse_timescale("$timescale 5 ns $end");

        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, 5);
        assert_eq!(res.2, "ns");
    }

    #[test]
    fn date() {
        let res = parse_date("$date Sept 10 2008 12:00:05 $end");

        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, "Sept 10 2008 12:00:05");
    }

    #[test]
    fn version() {
        let res = parse_version("$version Example Simulator V0.1 $end");

        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, "Example Simulator V0.1");
    }

    #[test]
    fn scope() {
        let res = parse_scope("$scope module top $end");

        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, "module");
        assert_eq!(res.2, "top");
    }

    #[test]
    fn variable() {
        let res = parse_variable("$var wire 32 ! data $end");

        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1.ty, "wire");
        assert_eq!(res.1.size, 32);
        assert_eq!(res.1.identifier, '!');
        assert_eq!(res.1.reference, "data");
    }

    #[test]
    fn timestamp() {
        let res = parse_timestamp("#34\n");

        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, 34);
    }

    #[test]
    fn bit_value_change() {
        let res = parse_value_change("x!\n");

        assert!(res.is_ok());
        let res = res.unwrap();
        assert!(res.is_some());
        let res = res.unwrap();

        assert_eq!(res.0.len(), 0);
        assert_eq!(res.1, "x");
        assert_eq!(res.2, '!');
    }

    #[test]
    fn enddefinitions() {
        let res = parse_enddefinitions("$enddefinitions $end");
        assert!(res.is_some());
        assert_eq!(res.unwrap().len(), 0);
    }

    #[test]
    fn full_parse() {
        let res = VCDFile::from_str(
            r#"$date Sept 10 2008 12:00:05 $end
$version Example Simulator V0.1 $end
$timescale 1 ns $end
$scope module top $end
$var wire 32 ! data $end
$var wire 1 @ en $end
$var wire 1 # rx $end
$var wire 1 $ tx $end
$var wire 1 % err $end
$var wire 1 ^ ready $end
$upscope $end
$enddefinitions $end
#0
b10000001 !
0@
1#
0$
1%
0^
#1
1@
#2
0@
#3
1@
#4
0@
#5
1@
#11
b0 !
0#
#16
b101010101010110101010101010101 !
1#
#20
0%
#23
"#,
        );

        assert!(res.is_ok());
        let file = res.unwrap();

        assert_eq!(file.date, "Sept 10 2008 12:00:05");
        assert_eq!(file.version, "Example Simulator V0.1");
        assert_eq!(file.timescale, (1, "ns".to_owned()));

        let scope = file.variables.scopes.first().unwrap();

        assert_eq!(scope.ty, Some("module".to_owned()));
        assert_eq!(scope.name, Some("top".to_owned()));
        assert_eq!(scope.scopes.len(), 0);
        assert_eq!(scope.variables.len(), 6);

        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 32
                    && p.reference == "data"
                    && p.identifier == '!'
                    && p.ty == "wire")
                .count(),
            1
        );
        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 1
                    && p.reference == "en"
                    && p.identifier == '@'
                    && p.ty == "wire")
                .count(),
            1
        );
        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 1
                    && p.reference == "rx"
                    && p.identifier == '#'
                    && p.ty == "wire")
                .count(),
            1
        );
        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 1
                    && p.reference == "tx"
                    && p.identifier == '$'
                    && p.ty == "wire")
                .count(),
            1
        );
        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 1
                    && p.reference == "err"
                    && p.identifier == '%'
                    && p.ty == "wire")
                .count(),
            1
        );
        assert_eq!(
            scope
                .variables
                .iter()
                .filter(|p| p.size == 1
                    && p.reference == "ready"
                    && p.identifier == '^'
                    && p.ty == "wire")
                .count(),
            1
        );

        let timeline = file.timeline;
        assert_eq!(timeline.len(), 6);

        assert_eq!(timeline.get(&'!').map(|t| t.len()), Some(3));
        assert_eq!(timeline.get(&'#').map(|t| t.len()), Some(3));
        assert_eq!(timeline.get(&'@').map(|t| t.len()), Some(6));
        assert_eq!(timeline.get(&'$').map(|t| t.len()), Some(1));
        assert_eq!(timeline.get(&'%').map(|t| t.len()), Some(2));
        assert_eq!(timeline.get(&'^').map(|t| t.len()), Some(1));
    }
}