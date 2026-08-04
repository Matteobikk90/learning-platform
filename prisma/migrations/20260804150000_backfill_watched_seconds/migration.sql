UPDATE "ModuleProgress"
SET "watchedSeconds" = GREATEST("watchedSeconds", "progressSeconds");
