<template>
	<div class="error">
		<h2>{{ error.message }}</h2>
	</div>
</template>

<script>
	export default {
		name: 'Error',
		props: ['error'],
	};
</script>

<style>
	.error {
		color: white;
		background: rgb(255, 52, 52);
		border-radius: 1rem;

		text-align: center;

		margin: 0;
		padding: 10px 15px;

		position: absolute;
		top: 25px;
		left: 52.5%;
		z-index: 1;

		transform: translateX(-50%);
	}

	.error h2 {
		font-family: 'Roboto Slab', sans-serif;
		font-size: 18px;
		font-weight: 500;

		margin: 0;
	}
</style>
