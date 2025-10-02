# Changelog

All notable changes to this project will be documented in this file.

## [0.1.7] - 2025-10-02

### Added Maintainer
- Added npm maintainer account with attached orcid for preprint release.

## [0.1.6] - 2025-09-24

### Fixed
- Implemented unique title generation to prevent `422` errors on dev.to.

## [0.1.5] - 2025-09-24

### Fixed
- Ensured correct string literal termination in `index.js` (fix for `SyntaxError`).

## [0.1.4] - 2025-09-24

### Fixed
- Corrected a `SyntaxError: Invalid or unexpected token` in `index.js`.

## [0.1.3] - 2025-09-24

### Fixed
- Corrected the import of the `open` package to resolve 'open is not a function' error.

## [0.1.2] - 2025-09-24

### Added
- New `autopublish` command to generate and automatically publish articles.

### Changed
- `publish` command no longer deletes the draft file after publishing.

## [0.1.1] - 2025-09-24

### Changed
- Updated package version to 0.1.1 to allow publishing.

## [0.1.0] - 2025-09-24

### Added
- Initial version of the script to generate and publish articles to dev.to.
- Modular structure with separate functions for content generation, publishing, verification, and logging.
- Verification module to check if the post is live after publishing.
- Logging module to record publishing activity in `publish.log`.
- Improved CLI experience with `yargs` for command parsing and `chalk` for colored output.
- Emojis to the console output for a more engaging experience.
- Relevant draft file names based on the topic.
- Draft files are now saved in the current working directory.
- Automatically opens the published article in the user's default browser.

### Changed
- Refactored `index.js` to be more modular and readable.
- Updated `README.md` with current features and usage instructions.
- Suppressed `dotenv` startup message for a cleaner console output.
- Changed console output color from blue to cyan.
- Updated `package.json` with author information and set the license to `UNLICENSED`.

### Fixed
- `chalk` compatibility issue by downgrading to version 4.
