<template>
	<div id="background"></div>
	<div class="loading__screen" v-if="loading">
		<h1>Loading<span>...</span></h1>
	</div>

	<div class="login__container" v-if="showLoginForm">
		<iframe class="login__form" src="https://natscamp-money-manager.herokuapp.com/login" frameborder="0" @load="loading = false"></iframe>
		<!-- <button class="login__form--close" type="button" @click="showLoginForm = false">❌</button> -->
	</div>

	<main class="main__content">
		<div class="tabs">
			<button class="tab" :class="{ active: tab.isActive }" v-for="tab in tabs" :title="tab.name" :key="tab.id" @click="switchTab(tab.id)">{{ tab.icon }}</button>
		</div>

		<transition-group tag="div" class="app__screen" name="tabs" appear>
			<Home v-show="tabs[0].isActive" :key="0" @switchToEntry="switchToEntry" @switchToReminder="switchToReminder" />
			<Entries v-show="tabs[1].isActive" :key="1" :selectedEntry="goToEntry" @validationError="showError" />
			<Reminders v-show="tabs[2].isActive" :key="2" :selectedReminder="goToReminder" @validationError="showError" @alert="alertReminder" />
		</transition-group>
	</main>

	<transition name="error">
		<Error v-if="renderError" :error="error" />
	</transition>

	<transition appear @before-enter="beforeEnter" @enter="enter" @leave="leave">
		<div class="alerts--queue" v-if="alerts.length">
			<div class="alert--overlay">
				<Alert v-for="(alert, index) in alerts" :key="index" :alert="alert" :forceClose="forceClose" @close="closeAlert" @closeAll="closeAllAlerts" />
			</div>
		</div>
	</transition>
</template>

<script>
	import Home from '@/components/Home.vue';
	import Entries from '@/components/Entries.vue';
	import Reminders from '@/components/Reminders.vue';
	import Alert from '@/components/Alert.vue';
	import Error from '@/components/Error.vue';

	import gsap from 'gsap';

	export default {
		name: 'App',
		components: { Home, Entries, Reminders, Alert, Error },

		mounted() {
			// Only allow login when online
			if (!navigator.onLine) {
				this.showLoginForm = false;
			}

			// Listen for iframe messages
			window.addEventListener('message', this.handleMessages);
		},

		data() {
			return {
				tabs: [
					{ id: 0, name: 'Home', icon: '🏠', isActive: true },
					{ id: 1, name: 'Entries', icon: '📔', isActive: false },
					{ id: 2, name: 'Reminders', icon: '🔔', isActive: false },
				],

				loading: true,
				showLoginForm: true,
				loggedIn: false,

				renderError: false,
				error: '',

				alerts: [],
				forceClose: false,

				goToEntry: {
					_selectedEntry: '',
					_showEntry: false,
				},

				goToReminder: {
					_selectedRemId: '',
					_selectedRemType: '',
					_showRem: false,
				},
			};
		},

		methods: {
			// Tab methods
			switchTab(id) {
				this.tabs.forEach((tab) => (tab.isActive = false));
				this.tabs[id].isActive = true;
			},

			switchToEntry(id) {
				this.switchTab(1);
				this.goToEntry._selectedEntry = id;
				this.goToEntry._showEntry = true;
			},

			switchToReminder(idAndType) {
				this.switchTab(2);
				[this.goToReminder._selectedRemId, this.goToReminder._selectedRemType] = idAndType;
				this.goToReminder._showRem = true;
			},

			// User methods
			handleMessages(ev) {
				if (!ev.isTrusted || ev.origin !== 'https://natscamp-money-manager.herokuapp.com') return;

				// Get data
				const { data } = ev;

				// Guard clause
				if (data.status !== 'success' || !data.token) return;

				// Get token and save to storage
				sessionStorage.setItem('JWT', data.token);

				// Close form
				this.showLoginForm = false;
				this.loggedIn = true;
			},

			// Error methods
			showError(error) {
				this.error = error;
				this.renderError = true;

				setTimeout(() => (this.renderError = false), 3000);
			},

			// Alert methods
			alertReminder(rem) {
				// Change the type of the reminder
				if (rem.type === 'pending') {
					if (rem.repeat) {
						// Change type and reset timer
						rem.type = 'active';
						rem.time = new Date(rem.time.getTime() + rem.repeat);
					} else {
						// Just change type
						rem.type = 'complete';
					}
				}

				if (rem.type === 'active') {
					// Reset timer
					rem.time = new Date(rem.time.getTime() + rem.repeat);
				}

				// Move reminder to alert array
				const alert = { ...rem };
				this.alerts.unshift(alert);
			},

			closeAlert(id) {
				const alertIndex = this.alerts.findIndex((alr) => alr.id === id);
				this.alerts.splice(alertIndex, 1);
			},

			closeAllAlerts() {
				this.forceClose = true;
				setTimeout(() => (this.forceClose = false), 5000);
			},

			// Transition methods
			beforeEnter(el) {
				el.style.opacity = 0;
			},
			enter(el, done) {
				gsap.to(el, { opacity: 1, duration: 0.5, onComplete: done });
			},

			leave(el, done) {
				gsap.to(el, { opacity: 0, duration: 0.5, onComplete: done });
			},
		},
	};
</script>

<style>
	:root {
		--bg-color: #2e2c29;
	}

	body {
		margin: 0;
		padding: 0;
		box-sizing: border-box;

		overflow: hidden;
		user-select: none;
	}

	#app {
		text-align: center;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;

		min-height: 100vh;
	}

	#background {
		background: url('./assets/background.jpg') fixed;
		background-size: cover;
		outline: 2px solid var(--bg-color);
		filter: blur(3px);

		width: 100%;
		height: 100%;

		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
	}

	.loading__screen {
		background: var(--bg-color);

		width: 100vw;
		height: 100vh;

		display: flex;
		align-items: center;
		justify-content: center;

		position: fixed;
		inset: 0;
		z-index: 9999;
	}
	.loading__screen > h1 {
		color: white;
		font-family: 'Roboto Slab', serif;
		font-size: 4rem;
		text-align: center;
		text-transform: uppercase;
	}
	.loading__screen > h1 span {
		position: relative;
		isolation: isolate;
	}
	.loading__screen > h1 span::after {
		content: '';
		background: var(--bg-color);
		height: 100%;
		position: absolute;
		inset: 0;

		animation: loading 3s steps(4, jump-none) infinite;
	}
	@keyframes loading {
		0% {
			left: 0;
		}
		100% {
			left: 100%;
		}
	}

	.main__content {
		height: 100vh;

		display: flex;
	}

	.login__container {
		width: 100%;
		height: 100%;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
	}

	.login__form {
		border: none;

		width: 100%;
		height: 100%;
	}

	.login__container .login__form--close {
		background: none;
		border: none;
		border-radius: 1rem;
		outline: none;

		font-size: 1.5rem;
		text-align: center;

		padding: 5px;

		position: absolute;
		top: 5px;
		right: 5px;

		transition: background 0.4s ease;
		cursor: pointer;
	}
	.login__container .login__form--close:hover {
		background: hsla(0, 0%, 50%, 0.25);
	}

	.container {
		color: black;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 5px;
		box-shadow: 4px 4px 15px 5px rgba(0, 0, 0, 0.25);

		width: 75%;
		height: 75%;
		margin-top: 10px;
		padding: 10px;

		display: grid;
		grid-template-columns: 2fr 1fr;

		overflow: hidden;
	}

	.errMessage {
		margin: 50px auto;
	}

	/* Tab Transitions */
	.tabs-enter-from {
		opacity: 0;
		transform: scale(0.8);
	}

	.tabs-enter-active {
		transition: all 0.5s ease;
	}

	/* List Transitions */
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(10px);
	}
	.fade-enter-active,
	.fade-leave-active {
		transition: all 0.5s ease;
	}

	/* Entry Transitions */
	.items-enter-from,
	.items-leave-to {
		opacity: 0;
		transform: scale(0.6);
	}

	.items-enter-active {
		transition: all 0.3s ease-in;
	}
	.items-leave-active {
		transition: all 0.3s ease-in;
		position: absolute;
	}

	.items-move {
		transition: all 0.3s ease;
		transition-delay: 0.1s;
	}

	/* Error Transitions */
	.error-enter-from,
	.error-leave-to {
		opacity: 0;
		top: -25px;
	}

	.error-enter-to,
	.error-leave-from {
		opacity: 1;
		top: 25px;
	}

	.error-enter-active {
		transition: all 0.3s ease;

		animation-name: error;
		animation-duration: 0.3s;
		animation-delay: 0.4s;
		animation-timing-function: ease;
	}
	.error-leave-active {
		transition: all 0.3s ease;
	}

	@keyframes error {
		20% {
			transform: translateX(-55%);
		}
		40% {
			transform: translateX(-45%);
		}
		60% {
			transform: translateX(-53%);
		}
		80% {
			transform: translateX(-47%);
		}
	}
</style>

<style scoped>
	.tabs {
		background: rgba(255, 255, 255, 0.1);
		border-right: 1px solid rgba(192, 192, 192, 0.5);
		backdrop-filter: blur(3px);

		height: 100%;
		width: clamp(50px, 4vw, 60px);

		display: flex;
		flex-direction: column;
		align-items: center;

		position: relative;

		overflow: hidden;
	}

	.tab {
		background: rgba(255, 255, 255, 0.3);
		border: none;
		border-top: 1px solid grey;
		outline: none;

		font-size: 1.5em;

		height: 60px;
		width: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		transition: background 250ms ease-out;

		cursor: pointer;
	}

	.tab.user {
		position: absolute;
		bottom: 0;
	}

	.tab.active,
	.tab:hover {
		background: rgba(255, 255, 255, 0.7);
	}

	.app__screen {
		width: 100%;
		height: 100%;

		position: relative;

		overflow: hidden;
	}

	/* Alerts */
	.alerts--queue {
		width: 100%;
		height: 100%;

		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
	}

	.alert--overlay {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(3px);

		height: 100%;
		width: 100%;
	}
</style>
