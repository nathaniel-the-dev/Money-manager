<template>
	<div class="reminders__screen">
		<h1>My Reminders</h1>

		<div class="container">
			<div class="reminders__container">
				<!-- Reminders -->
				<transition name="fade" mode="out-in">
					<h2 v-if="!reminders.length" class="errMessage">No reminders found. Try adding one.</h2>

					<div class="reminder__lists--container" v-else>
						<ul v-for="(list, index) in remindersByType" :key="index" class="reminder__list" :class="`${list.type}__reminders`" :ref="`${list.type}List`">
							<h3 :key="index">{{ list.type }}</h3>

							<transition-group name="items" mode="out-in">
								<li v-for="reminder in list.reminders" :id="reminder.id" :key="reminder.id" class="reminder">
									<section class="reminder__info">
										<span class="reminder__title">{{ reminder.title }}</span>
										<div class="reminder__date--container">
											<span class="reminder__date">{{ formatDate(reminder.time) }}</span>
											<span class="reminder__time">{{ formatTime(reminder.time) }}</span>
										</div>
									</section>

									<section v-if="reminder.description" class="reminder__description">{{ reminder.description }}</section>

									<section class="reminder__buttons">
										<button title="Stop repeating" v-if="reminder.type === 'active'" @click="stopTimer(reminder.id)">Stop</button>
										<button title="Delete reminder" @click="deleteReminder(reminder.id)">Delete</button>
									</section>
								</li>
							</transition-group>
						</ul>
					</div>
				</transition>
				<button class="add__reminder--btn" title="Add a reminder" @click="showModal = true">Add Reminder</button>
			</div>
		</div>

		<transition appear @before-enter="beforeEnter" @enter="enter" @before-leave="beforeLeave" @leave="leave">
			<Modal v-if="showModal">
				<template v-slot:remindersForm>
					<form class="reminder__form">
						<h2>Add a Reminder</h2>

						<label>Title*</label>
						<input class="reminder--title__input" type="text" v-model="reminder.title" maxlength="50" />

						<label>Time*</label>
						<input class="reminder--time__input" type="datetime-local" v-model="reminder.time" :min="minTime" ref="timeInput" />

						<label>Repeat</label>
						<select class="reminder--repeat__input" v-model="reminder.repeat">
							<option value="0">Never</option>
							<option value="86400000">Everyday</option>
							<option value="259200000">Every 3 days</option>
							<option value="604800000">Everyweek</option>
						</select>

						<label>Description</label>
						<textarea class="reminder--description__input" v-model="reminder.description" maxlength="255" wrap="hard"></textarea>

						<div class="modal__buttons">
							<button class="submit__btn" type="submit" @click.prevent="addReminder">Add</button>
							<button class="reset__btn" type="reset" @click="resetModal">Cancel</button>
						</div>
					</form>
				</template>
			</Modal>
		</transition>
	</div>
</template>

<script>
	import Modal from '@/components/Modal.vue';

	import gsap from 'gsap';
	import { v4 as uuidv4 } from 'uuid';

	export default {
		name: 'Reminders',

		components: { Modal },
		props: ['selectedReminder'],

		mounted() {
			// Check for alerts
			this.checkForAlerts();

			setInterval(() => {
				this.now = new Date();
			}, 1000);

			// Load data from storage
			if (!localStorage.getItem('reminders')) this.updateStorage();
			this.reminders = JSON.parse(localStorage.getItem('reminders'));
			this.reminders.forEach((rem) => (rem.time = new Date(rem.time)));
			this.reminders.forEach((rem) => (rem.repeat = +rem.repeat));
		},
		updated() {
			//Select reminder
			if (this.selectedReminder._selectedRemId && this.selectedReminder._showRem) {
				this.$refs[`${this.selectedReminder._selectedRemType}List`].querySelectorAll('li').forEach((el) => {
					if (el.id === this.selectedReminder._selectedRemId) el.scrollIntoView({ behavior: 'smooth' });
				});
			}
			this.selectedReminder._showRem = false;
		},

		data() {
			return {
				//Modal variables
				showModal: false,
				showAlert: false,

				// State variables
				reminders: [],

				// Reminder variables
				reminder: {
					title: '',
					time: '',
					repeat: 0,
					description: '',
				},

				// Alert variables
				alerts: [],

				// Other variables
				now: new Date(),
			};
		},

		methods: {
			// Reminder methods
			addReminder() {
				try {
					// Validate data
					this.validateData();

					// Modify reminder object
					this.reminder.id = uuidv4();
					this.reminder.type = 'pending';
					this.reminder.time = new Date(this.$refs.timeInput.value);
					this.reminder.title = this.reminder.title.trim();
					this.reminder.description = this.reminder.description.trim();
					this.reminder.repeat = +this.reminder.repeat;

					// Add reminder to array
					const reminder = { ...this.reminder };
					this.reminders.unshift(reminder);

					// Update storage
					this.updateStorage();

					// Reset modal
					this.resetModal();
				} catch (error) {
					this.$emit('validationError', error);
				}
			},

			deleteReminder(id) {
				// Find reminder
				const reminderIndex = this.reminders.findIndex((rem) => rem.id === id);

				// Remove reminder
				this.reminders.splice(reminderIndex, 1);

				// Update storage
				this.updateStorage();
			},

			stopTimer(id) {
				// Find reminder
				const reminder = this.reminders.find((rem) => rem.id === id);

				// Change type
				reminder.type = 'complete';
				reminder.repeat = 0;

				// Update storage
				this.updateStorage();
			},

			validateData() {
				// Check title
				if (this.reminder.title.trim() === '') throw new Error('Reminder must have a title');

				// Check time
				if (this.reminder.time === '') throw new Error('Reminder must have a valid time');
				if (new Date(this.reminder.time).getTime() < Date.now()) throw new Error('Reminder cannot be set in the past');
			},

			// Alert methods
			checkForAlerts() {
				setInterval(() => {
					this.reminders.forEach((rem) => {
						// Guard clauses
						if (rem.type === 'complete') return;
						if (rem.time.getTime() > Date.now()) return;

						// Move reminder
						this.$emit('alert', rem);

						// Update storage
						this.updateStorage();
					});
				}, 1000);
			},

			// Formatting methods
			formatDate(date) {
				return new Intl.DateTimeFormat(navigator.language, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
			},

			formatTime(time) {
				return new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric' }).format(time);
			},

			// Modal methods
			beforeEnter(el) {
				el.style.opacity = 0;

				const modal = el.querySelector('.modal');
				modal.style.opacity = 0;
				modal.style.transform = 'translateY(-150%)';
			},
			enter(el, done) {
				const modal = el.querySelector('.modal');

				gsap.to(el, { opacity: 1, duration: 0.333 });
				gsap.to(modal, { y: 0, opacity: 1, duration: 0.4, onComplete: done });
			},

			beforeLeave(el) {
				el.style.opacity = 1;

				const modal = el.querySelector('.modal');
				modal.style.opacity = 1;
				modal.style.transform = 'translateY(0)';
			},

			leave(el, done) {
				const modal = el.querySelector('.modal');

				gsap.to(el, { opacity: 0, duration: 0.333 });
				gsap.to(modal, { y: '-150%', opacity: 0, duration: 0.4, onComplete: done });
			},

			resetModal() {
				this.reminder = { id: String, title: '', time: '', repeat: 0, description: '' };
				this.showModal = false;
			},

			// Other methods
			updateStorage() {
				localStorage.setItem('reminders', JSON.stringify(this.reminders));
			},
		},

		computed: {
			remindersByType() {
				return [
					{ type: 'pending', reminders: this.reminders.filter((rem) => rem.type === 'pending') },
					{ type: 'active', reminders: this.reminders.filter((rem) => rem.type === 'active') },
					{ type: 'complete', reminders: this.reminders.filter((rem) => rem.type === 'complete') },
				];
			},

			minTime() {
				let date = this.now.toISOString().slice(0, -8);
				date = date.split(':');

				date[0] = date[0].split('T');
				date[0][1] = `${+date[0][1] - 5}`;
				date[0] = date[0].join('T');

				date[1] = `${+date[1] + 5}`;
				date = date.join(':');

				return date;
			},
		},
	};
</script>

<style>
	/* Main */
	.reminders__screen {
		color: white;
		font-family: 'Roboto Slab', serif;
		text-align: center;

		width: 100%;
		height: 100vh;

		display: flex;
		flex-direction: column;
		align-items: center;

		overflow: hidden;
	}

	.reminders__screen h1 {
		font-size: 48px;
		font-weight: 500;
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
		margin: 30px auto 20px auto;
	}

	.reminders__container {
		background: white;
		border-radius: 0.5rem;

		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;

		grid-column: 1 / 3;

		position: relative;

		overflow: hidden;
	}

	.reminder__lists--container {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.reminder__list {
		border: 1px solid silver;
		border-radius: 3px;
		box-shadow: 2px 2px 10px 3px rgba(0, 0, 0, 0.25);

		height: 57.5vh;
		width: 100%;
		padding: 50px 5px 0 5px;
		margin: 10px;

		display: flex;
		flex-direction: column;
		align-items: center;

		position: relative;

		overflow-x: hidden;
		overflow-y: auto;

		list-style: none;
	}

	.reminder__list.pending__reminders {
		background: rgba(190, 190, 190, 0.8);
	}
	.reminder__list.active__reminders {
		background: rgba(145, 255, 145, 0.8);
	}
	.reminder__list.complete__reminders {
		background: rgba(255, 221, 128, 0.8);
	}

	.reminder__list::-webkit-scrollbar {
		width: 10px;
	}
	.reminder__list::-webkit-scrollbar-thumb {
		background: rgb(170, 170, 170);
		border-radius: 1rem;
	}
	.reminder__list::-webkit-scrollbar-thumb:hover,
	.reminder__list::-webkit-scrollbar-thumb:active {
		background: rgb(150, 150, 150);
	}

	.reminder__list h3 {
		font-size: 24px;
		font-weight: 500;
		text-transform: uppercase;
		text-decoration: underline;

		margin: 10px;

		position: absolute;
		top: 0;
		z-index: 1;
	}

	.reminder {
		color: rgb(50, 50, 50);
		background: white;
		border: 1px solid rgb(200, 200, 200);
		border-radius: 5px;
		box-shadow: 0px 2px 5px rgb(150, 150, 150);

		width: 100%;
		margin: 10px 0;

		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.reminder .reminder__info {
		font-family: 'Source Sans Pro', serif;

		padding: 0 5px;

		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.reminder .reminder__title {
		font-size: 20px;
		font-weight: 600;
		text-align: left;
		text-transform: capitalize;
	}

	.reminder .reminder__date--container {
		font-family: 'Roboto Slab', serif;
		font-size: 14px;

		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
	}

	.reminder .reminder__date {
		font-weight: 500;
	}
	.reminder .reminder__time {
		font-size: 14px;
	}

	.reminder .reminder__description {
		text-align: left;

		padding: 0 5px;
	}

	.reminder .reminder__buttons {
		border-top: 1px solid silver;

		text-align: right;
		padding: 0 5px;
	}

	.reminder .reminder__buttons button {
		background: rgb(230, 230, 230);
		border: none;
		outline: none;
		border-radius: 5px;
		border: 1px solid rgba(128, 128, 128, 0.6);
		box-shadow: 0px 1px 2px black;

		padding: 3px;
		margin: 5px 0px 5px 5px;

		transition: 0.2s all ease;

		cursor: pointer;
	}

	.reminder .reminder__buttons button:hover {
		color: rgb(255, 0, 0);
		background: rgb(210, 210, 210);
	}

	.add__reminder--btn {
		background: rgb(230, 230, 230);
		outline: none;
		border: 2px solid rgba(0, 0, 0, 0.6);
		border-radius: 0.5rem;

		font-family: 'Roboto Slab', serif;
		font-size: 18px;
		font-weight: 500;

		width: fit-content;
		padding: 5px;

		position: absolute;
		bottom: 10px;

		transition: all 250ms ease;

		cursor: pointer;
	}

	.add__reminder--btn:hover {
		background: rgb(200, 200, 200);
		transform: scale(1.05);
	}
</style>
