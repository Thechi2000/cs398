use std::sync::Mutex;

use crate::project::Project;

pub type AppState<'r> = tauri::State<'r, Mutex<State>>;

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

    pub fn project_mut(&mut self) -> &mut Option<Project> {
        &mut self.project
    }
}
