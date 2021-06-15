<template>
	<div class="alert" :class="'alert__' + alert.type">
		<h1>{{ alert.title }}</h1>
		<h3>{{ formattedTime }}</h3>
		<p>{{ alert.description }}</p>

		<button class="close__alert--ok__btn" @click="$emit('close', alert.id)">Ok</button>
		<button class="close__alert--all__btn" @click="$emit('closeAll')">Close All</button>
		<button class="close__alert--x__btn" @click="$emit('close', alert.id)">✖</button>
	</div>
</template>

<script>
	export default {
		name: 'Alert',

		props: ['alert', 'forceClose'],

		updated() {
			if (this.forceClose) this.$emit('close', this.alert.id);
		},

		mounted() {
			const notif = new Notification(this.alert.title, { body: `${this.alert.type}\n${this.formattedTime}\n${this.alert.description}` });
			notif.onclick = () => window.ipcRenderer.send('notificationClick');
		},

		computed: {
			formattedTime() {
				return new Intl.DateTimeFormat(navigator.language, {
					month: 'long',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				}).format(new Date(this.alert.time));
			},
		},
	};
</script>

<style>
	.alert {
		color: rgb(50, 50, 50);
		background: white;
		border: 1px solid rgb(100, 100, 100);
		border-radius: 1rem;
		box-shadow: 0px 0px 10px 5px rgb(100, 100, 100);

		text-align: center;

		height: fit-content;
		min-width: 40%;
		padding: 50px 20px 20px 20px;

		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 2;

		transform: translate(-50%, -50%);
	}

	.alert h1,
	.alert h3,
	.alert p {
		font-family: 'Roboto Slab', sans-serif;
		font-weight: 400;
	}

	.alert h1 {
		font-size: 36px;
		font-weight: 600;
		text-transform: capitalize;

		margin: 20px 0;
	}

	.alert h3 {
		border-bottom: 1px solid black;

		font-weight: 500;

		margin: 10px 0;
		padding-bottom: 5px;
	}

	.alert p {
		margin: 30px 0;
	}

	.close__alert--ok__btn,
	.close__alert--all__btn {
		color: rgb(75, 75, 75);
		border: none;
		outline: none;
		border-radius: 0.5rem;
		border: 1px solid rgb(175, 175, 175);

		font-family: 'Source Sans Pro', sans-serif;
		font-size: 24px;
		font-weight: 600;
		text-transform: uppercase;

		padding: 5px 10px;
		margin: 20px 10px 0;

		transition: all 250ms ease;

		cursor: pointer;
	}

	.close__alert--ok__btn:hover {
		background: rgba(0, 255, 0, 0.5);
	}
	.close__alert--all__btn:hover {
		background: rgba(255, 0, 0, 0.5);
	}

	.close__alert--x__btn {
		background: none;
		border: none;
		outline: none;

		font-size: 1.5em;
		line-height: 30px;

		padding: 0 5px;

		position: absolute;
		top: 10px;
		right: 10px;

		transition: all 333ms ease;

		cursor: pointer;
	}

	.close__alert--x__btn:hover {
		color: red;
	}
</style>
