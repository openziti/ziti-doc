# Chrome Origin Trials

BrowZer uses [JSPI](https://v8.dev/blog/jspi-newapi), or WebAssembly JSPI (JavaScript Promise Integration). This is
a new API to bridge JavaScript Promises with WebAssembly workflows and is vital to BrowZer's workflow.

JSPI is still in review and not fully adopted by chrome. Until JSPI is finalized, it needs to be externally enabled in the
browser.

JSPI can be enabled in multiple ways, including:

* by the end-user of the browser, by enabling the flag (down in chrome://flags)
* via what is known as an "Origin Trial 3" 

Some browsers (like Edge) have recently stopped making the JSPI flag available in the edge://flags UI for users to 
updated. The only way to enable JSPI for these browsers is via a Chrome Origin Trial.

It also is a better overall experience for end users. These users never need to manually enable JSPI or even know JSPI 
exists. Origin Trials will transparently enable the JSPI flag for the end-user of your BrowZer-protected web app.

## Sign Up 

To sign up for the Origin Trial you need to:

* visit [this page](https://developer.chrome.com/origintrials/#/register_trial/1603844417297317889) and register for the
  JSPI Trial 12. It's free.
* Sign in to Google using the button in the upper right corner
* fill in the fields
    * Web Origin: this should be your "wildcard url". If you obtained a wildcard cert for `*.mybrowzer.example.com`, 
      you would enter `mybrowzer.example.com` in this field
    * Check the "I need a token to match all subdomains of the origin"
    * Fill out the expected usage
    * Check all the checkboxes for the disclosures and acknowledgements after understanding them
    * Click Register

After filling out the fields you'll receive a token. Copy the token and use this token in your Browzer configuration