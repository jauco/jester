What to watch out for when upgrading dependencies

 - the config files are loaded hierarchically by jester. this means that any changes to the config format (including additions) might mean changes in their loaders
 - eslint and its formatter should probably be upgraded together
 - new karma releases sometimes have some subtle bugs that you only notice when running it for a while (such as browsers not closing)