<template>
  <svg :class="{loading, trans}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="130px" height="130px" viewBox="0 0 294 294" enable-background="new 0 0 294 294" xml:space="preserve">
<g>
	<g>
		<path fill="var(--extra-light-gray)" d="M191.529,239.46c-2.638,2.985-7.043,3.069-9.789,0.186l-39.048-40.996
			c-2.746-2.883-2.67-7.524,0.169-10.313l10.366-10.184c2.839-2.789,7.406-2.709,10.148,0.178l17.544,18.47
			c2.742,2.887,7.144,2.807,9.782-0.179l62.686-70.94c2.638-2.985,7.206-3.24,10.15-0.565l10.752,9.765
			c2.945,2.674,3.196,7.305,0.558,10.29L191.529,239.46z"/>
	</g>
	<g>
		<path fill="#64A1BC" class="path" d="M133.859,239.46c-2.638,2.985-7.047,3.073-9.799,0.195l-45.893-48.011
			c-2.751-2.878-2.679-7.515,0.16-10.304l10.366-10.184c2.839-2.789,7.413-2.716,10.164,0.162l24.375,25.499
			c2.751,2.878,7.161,2.791,9.799-0.195l62.686-70.94c2.638-2.985,7.206-3.24,10.15-0.565l10.752,9.765
			c2.945,2.674,3.196,7.305,0.558,10.29L133.859,239.46z"/>
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
  fill: var(--txt);
}

.illustration-colors .path {
  fill: var(--fade);
}

@keyframes path {
  from {
    fill: var(--light-gray);
  }
  to {
    fill: var(--primary-light);
  }
}

.loading .shape {
  fill: var(--card);
} 

.loading .path {
  fill: var(--fade);
  animation: .85s path linear 0s infinite alternate;
}

</style>
