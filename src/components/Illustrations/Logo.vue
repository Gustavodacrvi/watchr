<template>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="107.388px" height="61.922px" viewBox="0 0 147.388 101.922" enable-background="new 0 0 147.388 101.922"
	 xml:space="preserve">
<g>
	<g>
		<g>
			<path class='path' fill="#5F8DC3" d="M8.535,45.205c0,0,18.494,14.094,27.143,19.775C62.088,38.299,96.345,1.341,98.391,0l8.512,12.709
				c-0.477,0.395-35.618,42.867-62.66,84.829c-1.552,2.407-4.755,4.384-7.472,4.384c-4.063,0-4.335-0.377-11.277-10.02L0,56.485"/>
		</g>
	</g>
	<g opacity="0.45">
		<g>
			<path fill="#5F8DC3" class="shape" d="M55.411,54.039c0,0,12.103,5.26,20.752,10.94C102.573,38.299,136.83,1.341,138.877,0l8.512,12.709
				c-0.477,0.395-35.618,42.867-62.66,84.829c-1.552,2.407-4.755,4.384-7.472,4.384c-4.063,0-4.335-0.377-11.277-10.02L46.876,65.32
				"/>
		</g>
	</g>
</g>
</svg>

</template>

<script>

export default {
  props: ['loading', 'trans'], 
}

</script>

<style scoped>

.trans, .trans path, .trans {
  transition-duration: .3s;
}

.illustration-colors .shape {
  fill: var(--txt) !important;
}

.illustration-colors .path {
  fill: var(--fade) !important;
}

@keyframes path {
  from {
    fill: var(--light-gray) !important;
  }
  to {
    fill: var(--primary-light) !important;
  }
}

.loading .shape {
  fill: var(--card) !important;
} 

.loading .path {
  fill: var(--fade) !important;
  animation: .85s path linear 0s infinite alternate;
}

</style>
