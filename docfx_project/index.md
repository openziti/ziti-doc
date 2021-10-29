<style>
div#wrapper{
background: linear-gradient(90deg, rgba(244,4,77,1) 0%, rgba(0,104,249,1) 100%);
}
a.contribution-link{
background: white;
border-radius: 20px;
}
.subnav.navbar.navbar-default{
    visibility: hidden;
}
article li{
color: whitesmoke;

            font-family: 'Open Sans', Tahoma, Helvetica, sans-serif;
}
.headerCallout {
    border-radius: 10px;
    margin-right: -15px;
    margin-left: -15px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 5px; 
    background: linear-gradient(45deg, #2d2848 40%, #425cc7 150%);
}

p{
    font-family: 'Open Sans', Tahoma, Helvetica, sans-serif;
    color: whitesmoke;
}
h1, p.h1{
    font-family: 'Russo One', 'Open Sans', Tahoma, Helvetica, sans-serif;
    font-size: xx-large;
    color: whitesmoke;
    padding-top: 10px;
}
span .emphasis{
    font-weight: bold;
    font-style: italic;
}
.row {
    flex: 0 0 100%;
    max-width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
    font-family: 'Open Sans', Tahoma, Helvetica, sans-serif;
}
.col-lg-12 {
    flex: 0 0 100%;
    max-width: 100%;
    font-family: "Russo One", 'Open Sans', Tahoma, Helvetica, sans-serif;
    justify-content: space-between;
}
.row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
    justify-content: space-between;
}
.features-small-item {
    cursor: pointer;
    display: block;
    background: whitesmoke;
    box-shadow: 0 2px 48px 0 rgb(0 0 0 / 20%);
    border-radius: 10px;
    text-align: center;
    transition: all 0.3s ease 0s;
    position: relative;
    margin: 10px;
}


.btn-hover.color-9 {
    background-image: linear-gradient(to right, #25aae1, #4481eb, #04befe, #3f86ed);
    box-shadow: 0 4px 15px 0 rgba(65, 132, 234, 0.75);
}
.btn-hover.color-4 {
    background-image: linear-gradient(to right, #fc6076, #ff9a44, #ef9d43, #e75516);
    box-shadow: 0 4px 15px 0 rgba(252, 104, 110, 0.75);
    height: 80px;
}
.color-4 p {
    margin-bottom: unset;
}
.btn-hover {
    width: 200px;
    font-size: 16px;
    font-weight: 600;
    color: black;
    cursor: pointer;
    margin: 5px 10px;
    height: 80px;
    text-align:center;
    border: none;
    background-size: 300% 100%;

    border-radius: 5px;
    -moz-transition: all .4s ease-in-out;
    -o-transition: all .4s ease-in-out;
    -webkit-transition: all .4s ease-in-out;
    transition: all .4s ease-in-out;
}

.btn-hover:hover {
    height: 80px;
    background-position: 100% 0;
    -moz-transition: all .4s ease-in-out;
    -o-transition: all .4s ease-in-out;
    -webkit-transition: all .4s ease-in-out;
    transition: all .4s ease-in-out;
}

.btn-hover:focus {
    outline: none;
}

a{
    text-decoration-line: underline;
    color: whitesmoke;
    position: relative;
}
a:hover{
    color: #ffb87c;
    text-decoration-line: underline !important;
}
.table-striped{
    background: none !important;
    outline: none !important;
    horiz-align: center !important;
}

</style>

<img src="https://ziti.dev/wp-content/uploads/2020/01/ziti.dev_.alt2_.png" height="100px" class="alignleft size-full wp-image-6451" style="margin-bottom: 40px;"/>

<div class="headerCallout">
    <p class="h1">Welcome to the OpenZiti Project!</p>
    <p>The OpenZiti project is an open source initiative focused on bringing Zero Trust to any application. 
The project provides all the pieces required to implement or integrate Zero Trust into your solutions:</p>
<ul>
<li>The overlay network</li>
<li>Tunneling Applications for all operating systems</li>
<li>Numerous SDKs making it easy to add Zero Trust concepts <span class="emphasis">directly into your application</span></li>
</ul>
<p>
Ziti makes it easy to embed Zero Trust, programmable networking directly into your app. With Ziti you can have
Zero Trust, high performance networking on any Internet connection, without VPNs!
</p>
</div>

<hr/>
<h1>Get Started - Build a Network!</h1>
<p>Ziti make Zero Trust easy but you'll need an overlay network in order to start on your Zero Trust journey. 
We recommend you start with a simple network. Once you understand the basic concepts it can make more sense to 
move on to more complex network topologies. Choose what sort of network you want to build.
</p>
<div class="col-lg-12">
    <div class="row">
        <button class="btn-hover color-4"><p>Everything Local<br/>(Not Docker)</p></button>
        <button class="btn-hover color-4"><p>Everything Local<br/>(I love Docker)</p></button>
        <button class="btn-hover color-4"><p>I Can Host It Myself</p></button>    
    </div>
</div>

<p>&nbsp;</p>
<hr/>

<h1>I Have a Network! What's Next?</h1>
<p>
Fantastic! Now that you have a [Ziti Network](~/ziti/overview.md#overview-of-a-ziti-network) all setup and ready to go, 
the next step is learning about all of the pieces which go into it. There's a lot to learn and 
[our docs](~/ziti/overview.md) are there to help you understand any extra details you need help ironing out. If the 
docs don't, we love issues for how to improve [our docs](~/ziti/overview.md) or if you're feeling up for it we'd love 
to see any PRs to make the docs better! You'll find a more extensive list of the 
[quickstarts](~/ziti/quickstarts/quickstart-overview.md) we have
</p>

<table>
<tr>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
</tr>
<tr>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
</tr>
<tr>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
</tr>
<tr>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
<td>
        <button class="btn-hover color-4">Example Using C-lang</button>
</td>
</tr>
</table>

<!--div class="col-lg-12">
    <div class="row">
        <button class="btn-hover color-4">Example Using C-lang</button>
        <button class="btn-hover color-4">Example Using Golang</button>
        <button class="btn-hover color-4"><p>I Can Host It Myself</p></button>
    </div>
</div>

<div class="col-lg-12">
    <div class="row">
        <button class="btn-hover color-4">Example Using C-lang</button>
        <button class="btn-hover color-4">Example Using Golang</button>
        <button class="btn-hover color-4"><p>I Can Host It Myself</p></button>    
    </div>
</div-->
