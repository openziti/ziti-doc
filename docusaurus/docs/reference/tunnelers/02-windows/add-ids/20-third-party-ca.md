# Third-Party CA

OpenZiti supports adding identities where the key and certificate are provided by a third-party CA.

is the act of bootstrapping trust between your computer and the OpenZiti Controller.
After creating an identity, or if you are given and identity in the form of a JWT file you can properly
bootstrap trust. If you need to, follow this [guide](/docs/learn/core-concepts/identities/creating) to
create an identity. Once creatd, transfer the JWT file to the Windows machine you want to enroll.

Go back to the **Ziti Desktop Edge for Windows** and click **ADD IDENTITY** in the top right of the UI.
![windows-with-jwt](/img/clients/windows-with-jwt.png)

After the context menu pops up, choose "With JWT". Select the JWT file and your identity will be enrolled.
You can now selectively enable/disable the service and see how many individual services your identity has access to.

![windows-after-enroll](/img/clients/windows-after-enroll.png)
