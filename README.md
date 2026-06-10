# Colorado Design System

The Colorado Design System is an ecosystem of tools that empower state agencies to build simple, accessible, and consistent digital services for all Coloradans.
This repository will contain the framework-agnostic design system code, as well as documentation regarding usage, contribution, and governance.

For now, please see our in-development [Figma Kit](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System) for the latest designs, and reach out to zach.alcorn@state.co.us if you are interested in learning more.

## About the Project

**{project_statement}**

<!---
### Project Vision
**{project vision}** -->

<!--
### Project Mission
**{project mission}** -->

## Core Team

A list of core team members responsible for the code and documentation in this repository can be found in [COMMUNITY.md](COMMUNITY.md).

## Repository Structure

<!--- TODO: Describe the repository as the content grows. -->

# Development and Software Delivery Lifecycle

The following guide is for members of the project team who have access to the repository as well as code contributors. The main difference between internal and external contributions is that external contributors will need to fork the project and will not be able to merge their own pull requests. For more information on contributing, see: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Branching Model

This project follows [trunk-based development](https://trunkbaseddevelopment.com/), which means:

* Make small changes in [short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) and merge to `main` frequently.
* Be open to submitting multiple small pull requests for a single ticket (i.e. reference the same ticket across multiple pull requests).
* Treat each change you merge to `main` as immediately deployable to production. Do not merge changes that depend on subsequent changes you plan to make, even if you plan to make those changes shortly.
* Make a ticket for any unfinished or partially finished work.
* Tests should be written for changes introduced, and adhere to the test percentage threshold determined by the project.

This project uses Github Actions which run the latest code in `main`.

Pull-requests are merged to `main`.

## Contributing

Thank you for considering contributing to an Open Source project of the US Government! For more information about our contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Community

The Colorado Design System team is taking a community-first and open source approach to the product development of this tool. We believe government software should be made in the open and be built and licensed such that anyone can download the code, run it themselves without paying money to third parties or using proprietary software, and use it as they will.

We know that we can learn from a wide variety of communities, including those who will use or will be impacted by the tool, who are experts in technology, or who have experience with similar technologies deployed in other spaces. We are dedicated to creating forums for continuous conversation and feedback to help shape the design and development of the tool.

We also recognize capacity building as a key part of involving a diverse open source community. We are doing our best to use accessible language, provide technical and process documents, and offer support to community members with a wide variety of backgrounds and skillsets.

### Community Guidelines

Principles and guidelines for participating in our open source community are can be found in [COMMUNITY.md](COMMUNITY.md). Please read them before joining or starting a conversation in this repo or one of the channels listed below. All community members and participants are expected to adhere to the community guidelines and code of conduct when participating in community spaces including: code repositories, communication channels and venues, and events.

## Governance

<!-- TODO: Make a short statement about how the project is governed (formally, or informally) and link to the GOVERNANCE.md file.-->

Information about how the Colorado Design System community is governed may be found in [GOVERNANCE.md](GOVERNANCE.md).

## Feedback

If you have ideas for how we can improve or add to our capacity building efforts and methods for welcoming people into our community, please let us know at **oit_coloradodigitalservice@state.co.us**. If you would like to comment on the tool itself, please let us know by filing an **issue on our GitHub repository.**

## Policies

### Security and Responsible Disclosure Policy

Vulnerability reports can be submitted through email to infosec@state.co.us. 

Review the [State of Colorado Disclosure Policy and scope:
](https://oit.colorado.gov/standards-policies-guides/guide-to-cybersecurity/office-of-information-security).

For more information about our Security, Vulnerability, and Responsible Disclosure Policies, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License.

All contributions to this project will be released under the MIT License. By submitting a pull request or issue, you are agreeing to comply with this license.