<script>

export const prerender = false;

import Router from 'svelte-spa-router'
import {wrap, link, push, pop, replace} from 'svelte-spa-router'
import Home from './routes/Home.svelte'
import PageTemplate from './routes/PageTemplate.svelte'
import Editor from './routes/Editor.svelte'


import NotFound from './routes/NotFound.svelte'
import { active, user, onscreen, currentPage } from './store.js';

let open = false;
$onscreen = {};
$onscreen.mainNav = true;
$currentPage = {};

$user = {
    screen_name: 'stacey',
};



const routes = {
    '/': wrap(
        Home,
        {foo: 'bar'},
        // First pre-condition function
        (detail) => {
            //console.log('home, our user is '+JSON.stringify($user))
            return true
        }),        
    '/about': wrap(
        // The Svelte component used by the route
        PageTemplate,
        {foo: 'bar'},
        // First pre-condition function
        (detail) => {
            $currentPage = {title: 'About Kwippe School',top: 'Virtual School tools for students and teacher. Try our graphical Homework Editor!', bottom: 'Doing your homework has never been so fun.'} 
            return true
        }),
    '/bye': wrap(
        // The Svelte component used by the route
        PageTemplate,
        {foo: 'bar'},
        // First pre-condition function
        (detail) => {
            $currentPage = {title: 'Adios!',top: 'Thanks for the visit. Have a great day!', bottom: 'We hope you visit again soon.'} 
            return true
        }), 
    '/login_error': wrap(
        // The Svelte component used by the route
        PageTemplate,
        {foo: 'bar'},
        // First pre-condition function
        (detail) => {
            $currentPage = {title: 'Caramba, problema!',top: 'Sorry!', bottom: 'Login connection error. Make sure your internet connection is working and try again.'} 
            return true
        }),         
   // '/dashboard/:details?': Dashboard
    '/editor': Editor
}

let lightCol = '#92d1f1';
let bgColor = '#42ade2'; 
let bgColors = {
    home: {lightCol: '#92d1f1', bgColor: '#42ade2'},
    about: {lightCol: '#c4e5df', bgColor: '#7dc5b8'},
    schedule: {bgColor: '#90aae2', lightCol: '#cddbfd'},
    bye: {lightCol: '#ddc9f7', bgColor: '#c4aae6'},
    public: {lightCol: '#dcdbe7',bgColor: '#c0bde7'},
    settings: {lightCol: '#dcdbe7',bgColor: '#c0bde7'},
    username: {bgColor: '#90aae2', lightCol: '#cddbfd'},
    editor: {lightCol: '#c4e5df',bgColor: '#7dc5b8'}
}

$active = {
    home: '#42ade2'
}
function routeLoaded(event) {
//     console.log('routeLoaded event')
//     console.log('Component', event.detail.component) // This is a Svelte component, so a function
//     console.log('Name', event.detail.name)
//     console.log('Location', event.detail.location)
//     console.log('Querystring', event.detail.querystring)
//     console.log('User data', event.detail.userData)
    $active = {};
    let name = 'home';
    let loc = event.detail.location;
    
    if (loc == '/schedule' && event.detail.querystring.length > 0) {
        let qs = event.detail.querystring.split('&');
        // check user from session, if not go ahead here
        $user = $user || {};
        $user.screen_name = qs[0];
        $user.token = qs[1];
        //console.log('querystring is '+event.detail.querystring);

        replace('/schedule');
    }
    if (loc == '/') loc = 'home';
    name = loc.replace('/', '').toLowerCase();
    $active[name] = bgColors[name].bgColor;
    lightCol = bgColors[name].lightCol;
    bgColor = bgColors[name].bgColor;
    //console.log('user is now '+JSON.stringify($user))
   // console.log('active is now '+JSON.stringify($active))
}  
</script>
<style>

:global(.hamburger) {
    z-index: 201;
    position: absolute;
    right: 0;
    top: 0;
}
:global(aside) {
    right: -100%;
    transition: right 0.3s ease-in-out;
    position:absolute;
    cursor: pointer;
    z-index: 101;
    top:0;
    background-color: #eee;
}
:global(.open) {
    right: 0
}
:global(.slideIn){
    width: 25vw;
    background: #eee;
    color: #2c3567;
    padding-top: 20px;
    overflow-y: scroll;
    height: 100vh;
    position:absolute;
}
:global(.slideIn > div) {
    padding: 10px;
}
:global(.slideBtn) {
    --text-opacity: 1;
color: #a0aec0;
color: rgba(160,174,192,var(--text-opacity));
}
html {
    height: 100vh;
    overflow:hidden;
}
a {
    text-decoration: none;
}
:global(.active) {
    pointer-events:none;
}
#content {
    z-index: 10;
}
:global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
} 
#bgGraphic {
    position: absolute;
    width: 100%;
    bottom: 0;
    transform: rotate(180deg);  
    clip-path: url(#svgBg);
    height: 700px;
    pointer-events:none;
}
#pattern {
    background-image: url(https://i.ya-webdesign.com/images/png-background-patterns-6.png);
/*    background-image: url(../images/geom.jpg);*/
    background-blend-mode: soft-light;  
    position: absolute;
    width: 100%;
    bottom: 0;
    height: 700px;
    transform: rotate(180deg);          
        pointer-events:none;   
    clip-path: url(#svgBg);         
    opacity: .5;
    }

h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
}

container {
    width: 100%;
    height: 100%;
    position: absolute;  
/*    overflow: hidden;*/

}
:global(#content) {
    margin-top: 60px;
}
#menuLinks > li > a {
    border-radius: 6px;
    margin-top: 15px;
    margin-right: 15px;
    padding: 10px;
    color: #08416d;
    text-transform: uppercase;
    font-weight: 700;
    font-family: 'Open Sans', sans-serif; 
    text-transform: uppercase;
}
#menuLinks > li > a:hover{
    background-color: #eee;
    opacity: .6;
    color: black;
}        
nav {
    top: 0;
    position: absolute;
    width: 100vw;
}

@media (min-width: 640px) {
    main {
        max-width: none;
    }
}
</style>
<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500&family=Tajawal&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./app.css">
    <link rel="stylesheet" href="./global.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./icons.css">
</svelte:head>
<div style="position: absolute; width: 100%; height:100%; background-color:{bgColor}">
        <div id="bgGraphic" style="background-color:{lightCol}">
    </div>
    <div id="pattern"></div>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 300 35.4" style="enable-background:new 0 0 300 35.4;" xml:space="preserve" width="100">
    <defs>
        <clipPath clipPathUnits="objectBoundingBox" transform="scale(0.01)" id="svgBg"><path d="M0,0v20.5c7.5-1.8,14.2,0.4,23.3,6.6c15.6,10.8,21.3,10.9,36,1.1c16.5-11,25.2-11.2,39.5-0.7c13.9,10.1,22.3,10.1,37.2,0
        c14.7-10,23.2-10.1,37.3-0.4c15.6,10.8,21.3,10.9,36,1.1c16.5-11,25.2-11.2,39.5-0.7c13.9,10.1,22.3,10.1,37.2,0
        c5.3-3.6,9.8-5.9,14-6.9V0H0z"/></clipPath>
    </defs>
    
</svg>   
</div>
<container id="container">
    {#if $onscreen.mainNav}
        <nav >
            <ul id="menuLinks">
                <li><a style="background-color:{$active.home || ''}" href="/#">home</a></li>
                <li><a style="background-color:{$active.about || ''}" use:link href="/about">about</a></li>
                <li><a style="background-color:{$active.editor || ''}" use:link href="/editor">homework editor</a></li>  
                {#if $user.screen_name}
                    <li><a style="background-color:{$active.schedule || ''}" use:link href="/{$user.screen_name}">schedule</a></li>    
                    <li><a style="background-color:{$active.settings || ''}" use:link href="/{$user.screen_name}/settings">settings</a></li>
                    <li><a href="http://127.0.0.1:8000/logout/{$user.screen_name}/{$user.token}">logout</a></li>
                {:else }
                    <li><a href="http://127.0.0.1:8000/login">login</a></li>
                {/if}
            </ul>
        </nav> 
    {/if}
    <div id="content">
        <Router {routes} on:routeLoaded={routeLoaded} />
    </div>

</container>
