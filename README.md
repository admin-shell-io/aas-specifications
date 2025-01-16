# Antora Meta-Repository - Asset Administration Shell (AAS)
# https://admin-shell-io.github.io/aas-specs-antora

This repository manages and contains the configurations for building the documentation website for the AAS by the [Industrial Digital Twin Association](https://industrialdigitaltwin.org).
It includes tools to generate the documentation on demand by compiling and assembling content from various remote repositories and sources written in AsciiDoc using [Antora](https://antora.org/).

## Sources
This repository does not contain the website's content itself; instead, it coordinates the assembly of content from external sources, including:
- [Part 1: Metamodel](https://github.com/admin-shell-io/aas-specs/)
- [Part 2: API Specifications](https://github.com/admin-shell-io/aas-specs-api)
- [Part 3a: IEC 61360](https://github.com/admin-shell-io/aas-specs-iec61360)
- [Part 4: Security](https://github.com/admin-shell-io/aas-specs-security/)
- [Part 5: AASX Package Format](https://github.com/admin-shell-io/aas-specs-aasx)

Detailed information about source management is available in the [Antora playbook](antora-playbook.yml).

## User-Interface
The user interface for the documentation is maintained separately in [aas-specs-antora-ui](https://github.com/admin-shell-io/aas-specs-antora-ui). 

## Building the Documentation
The documentation is dynamically generated
- Automatically every X-hours or
- Manually by authorized individuals
  - To build and deploy the documentation website manually:
    - Go to action [Publish Website](https://github.com/admin-shell-io/aas-specs-antora/actions/workflows/publish.yml)
    - Trigger the action by clicking on "Run Workflow" in the right corner

## PDF Versions of the Documentation Sources
The automatic generation and deployment system also generates pdf versions of all sources.
These are generated alongside the website at the same time.
For the time being, you can access them in the website using the button.

## Contribution Guidelines
Contributors should test changes locally before pushing to remote repositories to maintain the integrity of the documentation.
If local testing is not feasible, or if you require assistance, please [open an issue](https://github.com/admin-shell-io/aas-specs-antora/issues) for detailed guidance or to request manual build privileges.
While direct testing on the live website is possible, it's discouraged due to potential complications.
The site is also automatically updated several times a day, allowing for a natural review of changes.

## Usage

If you wish the set up this environment locally to generate the collective documentation or edit the due process to alter the results in the direction of your needs and desires, this section covers the steps and requirements in the process and aims to guide you broadly to ease the procedure.
If you require more assistance or proper documentation along the way, you should make use of the official [Antora documentation](https://docs.antora.org/antora/latest/).

### Prerequisites

Before proceeding, you are required to have the latest [Node.js LTS release](https://nodejs.org/en/download) installed on your Linux, Windows, or macOS machine.
You can then follow the steps [here](https://docs.antora.org/antora/latest/install/install-antora/) to install Antora and set it up.

### Building Locally
In order to locally build the documentation website on your own, you have to make sure you have Antora CLI installed on your machine first.
You can then continue with cloning this repository. All you have to do is run the following commands in order:
```
npm i
npx antora generate antora-playbook.yml
```
The generated website should appear under build.

### CI/CD Pipeline
This repository is scheduled to re-build and deploy the website X times a day.
This means content from the source repositories are pulled and website is built again accordingly.
If documentation changes are pushed to one of the source repositories, it might not appear instantly once they are pushed, you have to wait until the website rebuilds automatically.

## Managing Antora Specs Documentation

This guide provides a brief overview of how to manage documentation repositories (Doku-Repos) for Antora specs, including adding new repositories, structuring them appropriately, and manually triggering web documentation updates on GitHub.

### Adding New Documentation Repositories for Antora
This is as easy as changing the Antora playbook yml file.
Again, this will require you having privileged access to the repository.
If you are from the organization to manage the sources and the documentation etc., you may consider opening an issue here creating a pull request to add a new source repository.
We will accomodate you through the process of how the formatting and other details are to be managed so that you will be in a position to take over this mechanism onto yourself should such time arrive.

As a general introductory guide, refer to the original documentation you can find [here](https://docs.antora.org/antora/latest/playbook/content-source-url/).

Assuming the basic conditions that are mentioned are met, the following steps are to follow:

1. **Create a New Repository**: On GitHub, create a new repository to hold your AsciiDoc content.
This repository will be integrated with Antora to generate your documentation site.
   
3. **Configure Antora**: In the `antora-playbook.yml` file of your documentation site generator, add the new repository under the `content.sources` section.
Specify the `url` of your new repository and the `branches` to track.

   ```yaml
   content:
     sources:
       - url: https://github.com/<your-organization>/<new-repo-name>
         branches: [main]
   ```

5. **Commit and Push**: Save your changes to the `antora-playbook.yml` file, commit, and push them to your repository.

For detailed instructions, refer to [Antora's official documentation on configuring content sources](https://docs.antora.org/antora/latest/configure-content-sources/).

### Structuring Documentation Repositories for Antora

An Antora documentation repository must be structured to include at least the following:

- **Modules Directory**: Contains the documentation components, divided into multiple modules for organization.
- **Pages Directory**: Within each module, a `pages` directory holds the AsciiDoc files (.adoc) containing your documentation content.
- **Nav.adoc File**: A navigation file within each module directory to define the structure of your documentation in the generated site.

Example structure:

```
docs/
  modules/
    module-name/
      pages/
        index.adoc
      nav.adoc
```

For a comprehensive guide on structuring your documentation for Antora, see [Antora's official documentation on directory structure](https://docs.antora.org/antora/latest/standard-directories/).

## The PDF Files
We use the antora/pdf-extension to generate PDF files alongside the web pages.
We use our own [PDF Theme](pdf-theme.yml) to define our style and structure.
The configuration file for the PDF generation process is the [antora-assembler.yml](antora-assembler.yml).

The cover pages of these PDF files are not readily provided images.
Tho, we use an [image on our cover pages](cover.pdf) as the background.
Our goal is to embed as little as possible as part of this image.
Document properties like the title, subtitle, date, author, etc. are displayed as text on top of this background image.

We use a custom extension written in ruby.
This can be seen in the file [extended.rb](extended.rb).
This file is taken from the extension examples from the asciidoctor-pdf repository.
If numbering of paragraphs is no longer required, this can be disabled by editing the [antora-assembler.yml](antora-assembler.yml).
Deleting the option ```-r ./extended.rb``` after the command will disable this extension.
Numbering of paragraphs is mainly for debug and review purposes.

## License
This project is under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
