/*
Project state
 */

struct Project {
    /// Project name
    name: String,
    /// Directory to compile
    project_directory: String,
    /// Files to not compile
    excluded_files: Vec<String>,
}
