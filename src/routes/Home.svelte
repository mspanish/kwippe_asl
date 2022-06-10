<script>
import { user } from '../store.js';

//import jsonpipe from 'jsonpipe';

</script>
<style>
.einstein {
    margin-left: 150px;
    margin-top: -20px;
}
p {
    font-size: .8rem;
}
a {
    text-decoration:none;
    color: navy;
    display: inline;
}
footer {
    position: absolute;
    bottom: 0;
    text-align: center;
    width: 100vw;
    line-height: 2;
}

</style>
<div class="loud">
        <span style="display:block">Virtual School Made Easy.</span>
</div>
<div class="definition">Schedules based on simple playlists, ai based lesson cross-matching, standards alignment, and an innovative homework editor, builder, and grading tool.
</div>
     <img class="einstein" alt='Work and study smarter with Kwippe School' src='./images/einstein.svg'>
    {#if $user.screen_name}
        <div style="width: 100; text-align: center"></div>
       
    {:else}
        <a style="text-decoration: none" href="../login">
        <figure>
            <img alt='import followers from Twitter' src='./images/bird.png'>
            <figcaption>click to login our create your account</figcaption>
        </figure>
        </a>
    {/if}
<footer>
    <p>We thank Shanon He for the lovely image of Albert Einsten, found<span><a href="https://scidraw.io/drawing/130" target="_blank">here</a></span></p>
</footer>
