# Contributing to NetFoundry Open-Source Projects

NetFoundry welcomes all contributions large or small from the community. If you want to contribute to a NetFoundry repository this document will serve as a guide. Contributions can come in various forms such as [bug reports](#example-bugissue-report), engaging with other users by offering help on the the [discourse group](https://openziti.discourse.group/) and of course as code submissions. Please take a moment and read this document to see how you can help out.

## Bug/Issue Reports

If you have discovered a potential issue with any of the NetFoundry projects on GitHub please file a GitHub issue for the possible problem. We realize you are taking time out of your day to file the issue (thank you!) however we do ask that you take a moment to try to submit a high quality report of the issue. A high quality isuse report will ideally be short and direct and only as detailed as possible.

Here are some guidelines to follow when posting an issue:

* Make sure your steps are reporducible and clear. If you are submitting a bit of code that triggers the issue the code should be as terse as possible and only inclue the bits relevant to the issue being submitted.
* Search for similar issues before submitting an issue.
* Include version, branch or commit hash information in the bug to help someone else reproducing the bug. If you are not using the HEAD of main, search for closed issues to make sure this was not fixed recently or update to HEAD and reproduce the issue.
* If applicable to the issue and time permits we ask that you try to produce a test script or code that can trigger the issue. If the code is testable - produce an actual test case for the isuse.
* Including the OS, OS version, versions of tooling used to trigger the issue is always helpful. For example if issue is UI based including the browser and browser version is often very relevant. If the bug is inside an SDK - what version of the SDK is in use?
* We ask that you please not disclose security related issues on GitHub. Instead, please mail security@netfoundry.io with any issues which might be security related.

A high quality issue leaves as little room for ambiguity as possible. The more details provided the better.

Additional guidelines:

* The issue tracker is not for support requests. Please use the [discourse group](https://openziti.discourse.group/) for questions about "how do i do this" or for seeking additional information that may not be documented yet.
* You are expected to follow the [code of conduct](CODE_OF_CONDUCT.html) at all times. Please be respectful of issues entered by others.
* Keep responses in the issues specifically about the issue itself. If another issue arises or if discussion is warranted open a new issue and use the [discourse group](https://openziti.discourse.group/) accordingly.

### Example Bug/Issue Report

    Title: 
    Name with apostrophe breaks save functionality
    
    Description:
    While using the UI I noticed that when I enter a name with an apostrophe the form doesn't save and reports an error.
    
    Here's what I did:
    
    # Environment: Windows 10 [Version 10.0.18362.535]
    # Build from the main branch using `go version go1.13.4 linux/amd64`
    # Log into UI and click "new thing" using Firefox 71.0 (32 bit)
    # Fill out all the required fields
    # When filling out out the Name field ensure you use a name with an apostrophe. I used "Jerry O'Connell"
    # Click save - observe the error

## Code Contributions

Before a contribution can be accepted there is some bookeeping that needs to occur. NetFoundry requires external contributors to sign a Contributor License Agreement (CLA) in order to ensure our products can remain open sourece while still allowing NetFoundry to advance the products forward.

### Contributor License Agreement

So what is a Contributor License Agreement (CLA) anyway? A CLA is a document which explicitly defines the terms intellectual property is contributed to a company/project. Our CLA is based on the fine work from the Apache Software Foundation. In summary the CLA is effectively doing a few things. Ensure you read and understand the CLA you are signing. This summary is not legal advice

* Grant of Copyright License. You give NetFoundry permission to use your copyrighted work in the project you contributed to.
* Grant of Patent License. If your contributed work uses a patent, you give NetFoundry a license to use that patent in the project you have contributed to. You also agree that you have authorization to grant this license.
* No Warranty and no Support. By making a contribution you are not obligating yourself or your corporation to provide support for the contribution. You are also not agreeing to any warranty obligations or providing any assurances or guarantees about how it will perform.

### Submitting the CLA

In order to have a CLA on file you must download the CLA and sign it. If you are an individual you can download the [Individual Contributor License Agreement](./NetFoundry-ICLA.pdf). For contributors contributing on behalf of a corporation there exists a [Corporate Contributor License Agreement](./NetFoundry-CCLA.pdf). Once signed you will send the CLA to [cla@netfoundry.io](mailto:cla@netfoundry.io). We will process your request and add you as a contributor to the project. Note that submitting issues does not requires a CLA be signed. You also will only have to sign a single CLA regardless of which repository you are contributing to.

After being submitted please allow for a few business days for us to process your CLA submission. You will be notified by email of your acceptance and the provided GitHub id will be added as a contributor. NetFoundry pledges that any personal information will not be used in any way.

### Contributing

With the necessary paperwork complete you can now begin the process of getting your contribution into the targetted project! Like other open source projects we ask you to fork the repository in question, make your changes and then issue a pull request back to the main project line. If applicable write tests to go along with the code. Please file an issue in the GitHub issue for the pull request so that the commits can be traced back to the rationale for the change. As with all software projects the more code you change the longer it will take to review and accept the pull request. Short and simple pull requests are easy to review and accept so it's often adventageous to stage your changes accordingly. This is not always possible but it should be the target. New files should get the appropriate license header as well.
