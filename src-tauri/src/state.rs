use crate::project::Project;

pub struct State {
    project: Option<Project>,
}

impl State {
    pub fn new(project: Option<Project>) -> Self {
        Self { project }
    }

    pub fn project(&self) -> Option<&Project> {
        self.project.as_ref()
    }
}
