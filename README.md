# autodevto

A simple Node.js application to automatically generate & publish articles to your dev.to account. 

## Features

*   Generates a post summary using Google's Generative AI.
*   Saves the draft to your current working directory with a relevant file name.
*   Publishes the generated summary to your dev.to account.
*   Automatically opens the published article in your default browser.
*   Verifies that the post was published successfully.
*   Logs the publishing activity to `publish.log`.
*   A beautiful and smooth command-line interface.

## Setup

1.  Clone this repository.

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root of the project with the following content:

    ```
    GEMINI_API_KEY=your_gemini_api_key
    DEVTO_API_KEY=your_dev.to_api_key
    ```

    Replace `your_gemini_api_key` with your Google Generative AI API key and `your_dev.to_api_key` with your dev.to API key.


## Usage

The tool provides a simple and easy-to-use command-line interface.

```bash
autodevto --help
```

This will display the help menu:

```
autodevto <command>

Commands:
  autodevto generate [topic]     Generate a new tech summary
  autodevto publish [draft]      Publish the generated summary
  autodevto autopublish [topic]  Generate and automatically publish a tech summary

Options:
  --version    Show version number                                       [boolean]
  --confirm, -c  Confirm to publish                                      [boolean]
  --help       Show help                                                 [boolean]
```


1.  **Generate a new draft:**

    To generate a new tech summary, run the following command:

    ```bash
    autodevto generate "autodevto release readme npm"
    ```

    This will generate a new tech summary and save it as `autodevto-release-readme-npm.md` in your current directory.


2.  **Publish the draft:**

    By default, the `publish` command will perform a dry run. To actually publish your article, you need to use the `--confirm` flag.

    **Dry Run (Default):**
    ```bash
    autodevto publish autodevto-release-readme-npm.md
    ```
    This will show you the content that would be published without posting it to dev.to.

    **Publish for real:**
    ```bash
    autodevto publish autodevto-release-readme-npm.md --confirm
    ```
    This will publish the article and then open it in your default browser.

3.  **Autopublish:**

    To generate and automatically publish a tech summary without manual intervention, use the `autopublish` command:

    ```bash
    autodevto autopublish "latest AI trends"
    ```
    This will generate content, save it to a uniquely named draft file in your current directory, publish it, and open the article in your browser. The draft file will be retained.

## To-Do
*   [ ] Add Image Generation feature.
*   [ ] Improve error handling and add more tests.
