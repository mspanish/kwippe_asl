<script>

import { user, onscreen, currentPage } from '../store.js';

</script>

<div class="top">
    <div class="welcome hero">
        { $currentPage.top }
		
		<span style="display: block; margin-top:60px;">{ $currentPage.bottom }</span>
    </div>
</div>

