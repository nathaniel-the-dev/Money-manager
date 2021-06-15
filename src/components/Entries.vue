<template>
	<div class="entries__screen">
		<h1>My Entries</h1>

		<div class="container">
			<div class="entries__container">
				<!-- Entries -->
				<transition name="fade" mode="out-in">
					<h2 v-if="entries.length === 0" class="errMessage">No entries found. Try adding one.</h2>

					<ul v-else class="entries__list" ref="entryList">
						<transition-group name="items">
							<li class="entry" v-for="entry in entries" :key="entry.id" :id="entry.id" :class="{ entry__income: entry.type === 'income', entry__expense: entry.type === 'expense' }">
								<section class="entry__info">
									<span class="entry__date">{{ formatDate(entry.date) }}</span>
									<span class="entry__title">{{ entry.title }}</span>
									<span class="entry__amount">{{ formatAmount(entry.amount) }}</span>
								</section>

								<section class="entry__buttons">
									<button title="Edit entry" @click="editEntry(entry.id)">📝</button>
									<button title="Delete entry" @click="deleteEntry(entry.id)">❌</button>
								</section>

								<section class="entry__description" v-if="entry.description">
									{{ entry.description }}
								</section>
							</li>
						</transition-group>
					</ul>
				</transition>
			</div>

			<div class="balance__container">
				<h2 id="total__balance">Total Balance:</h2>
				<p>{{ formatAmount(balances.totalBalance) }}</p>

				<h2 id="total__incomes">Total Incomes:</h2>
				<p>{{ formatAmount(balances.totalIncomes) }}</p>

				<h2 id="total__expenses">Total Expenses:</h2>
				<p>{{ formatAmount(balances.totalExpenses) }}</p>

				<button class="add__entry--btn" title="Add an entry" @click="showModal = true">Add Entry</button>
			</div>
		</div>

		<!-- Input Modal -->
		<transition appear @before-enter="beforeEnter" @enter="enter" @before-leave="beforeLeave" @leave="leave">
			<Modal v-if="showModal">
				<template v-slot:entriesForm>
					<form class="entry__form" @submit.prevent="addEntry" @reset="resetModal">
						<h2>Add an Entry</h2>

						<label>Title*</label>
						<input class="entry__title--input" type="text" v-model="entry.title" maxlength="30" />

						<label>Type*</label>
						<select class="entry__type--input" v-model="entry.type">
							<option value=""></option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>

						<label>Amount*</label>
						<input type="number" class="entry__amount--input" v-model="entry.amount" min="1" max="1000000" />

						<label>Description</label>
						<textarea class="entry__description--input" v-model="entry.description" maxlength="255" wrap="hard" />

						<div class="modal__buttons">
							<button class="submit__btn" type="submit">Add</button>
							<button class="reset__btn" type="reset">Cancel</button>
						</div>
					</form>
				</template>
			</Modal>
		</transition>

		<!-- Edit modal -->
		<transition appear @before-enter="beforeEnter" @enter="enter" @before-leave="beforeLeave" @leave="leave">
			<Modal v-if="showEditModal">
				<template v-slot:entriesForm>
					<form class="entry__form" @submit.prevent="editEntry(_, true)" @reset="resetModal">
						<h2>Edit Entry</h2>

						<label>Title*</label>
						<input class="entry__title--input" type="text" v-model="entry.title" maxlength="30" />

						<label>Type*</label>
						<select class="entry__type--input" v-model="entry.type">
							<option value=""></option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>

						<label>Amount*</label>
						<input type="number" class="entry__amount--input" v-model="entry.amount" min="1" max="1000000" />

						<label>Description</label>
						<textarea class="entry__description--input" v-model="entry.description" maxlength="255" wrap="hard" />

						<div class="modal__buttons">
							<button class="submit__btn" type="submit">Add</button>
							<button class="reset__btn" type="reset">Cancel</button>
						</div>
					</form>
				</template>
			</Modal>
		</transition>
	</div>
</template>

<script>
	import { v4 as uuidv4 } from 'uuid';
	import gsap from 'gsap';

	import Modal from './Modal.vue';

	export default {
		name: 'Entries',

		components: { Modal },

		props: ['selectedEntry'],

		data() {
			return {
				// Modal variables
				showModal: false,
				showEditModal: false,

				// State variables
				entries: [],
				balances: {
					totalBalance: 0,
					totalIncomes: 0,
					totalExpenses: 0,
				},

				// Input Variables
				entry: {
					id: String,
					date: Date,
					type: '',
					title: '',
					amount: 0,
					description: '',
				},
				oldEntry: {},
			};
		},

		mounted() {
			// Loda data from storage
			if (!localStorage.getItem('entries')) this.updateStorage();
			this.entries = JSON.parse(localStorage.getItem('entries'));
			this.entries.forEach((entry) => (entry.date = new Date(entry.date)));
			this.entries.forEach((entry) => (entry.amount = +entry.amount));
			this.balances = JSON.parse(localStorage.getItem('balances'));
		},

		updated() {
			// Select entry
			if (this.selectedEntry._selectedEntry && this.selectedEntry._showEntry) {
				this.$refs.entryList.querySelectorAll(`li`).forEach((el) => {
					if (el.id === this.selectedEntry._selectedEntry) el.scrollIntoView({ behavior: 'smooth' });
				});
			}
			this.selectedEntry._showEntry = false;
		},

		methods: {
			// Entry methods
			addEntry() {
				try {
					// Validate entry info
					this.validateData();

					// Generate additional entry info
					this.entry.id = uuidv4();
					this.entry.date = new Date();
					this.entry.amount = +this.entry.amount;
					this.entry.title = this.entry.title.trim();
					this.entry.description = this.entry.description.trim();

					// Adds an entry
					const entry = { ...this.entry };
					this.entries.unshift(entry);

					// Calculate balances
					this.calculateBalances();

					// Update storage
					this.updateStorage();

					// Reset modal
					this.resetModal();
				} catch (error) {
					this.$emit('validationError', error);
				}
			},

			deleteEntry(id) {
				// Find entry
				const entryIndex = this.entries.findIndex((entry) => entry.id === id);

				// Remove entry
				this.entries.splice(entryIndex, 1);

				// Calculate balances
				this.calculateBalances();

				// Update storage
				this.updateStorage();
			},

			editEntry(id, changeValues = false) {
				if (!changeValues) {
					// Get selected entry
					this.oldEntry = this.entries.find((entry) => entry.id === id);

					// Show modal with values
					this.entry = Object.assign({}, this.oldEntry);
					this.showEditModal = true;
				}

				if (changeValues) {
					try {
						// Validate data
						this.validateData();

						// Replace values in old entry
						this.oldEntry.type = this.entry.type;
						this.oldEntry.title = this.entry.title;
						this.oldEntry.amount = +this.entry.amount;
						this.oldEntry.description = this.entry.description;

						// Calculate balances
						this.calculateBalances();

						// Update storage
						this.updateStorage();

						// Reset modal
						this.resetModal();
					} catch (error) {
						this.$emit('validationError', error);
					}
				}
			},

			validateData() {
				// Check title
				if (this.entry.title.trim() === '') throw new Error('Entry must have a title');

				// Check type
				if (this.entry.type === '') throw new Error('Entry must have a type');

				// Check amount
				if (this.entry.amount === '') throw new Error('Entry must have an amount');
			},

			// Balance Methods
			calculateBalances() {
				this.balances.totalIncomes = this.balances.totalExpenses = 0;

				this.entries.forEach((entry) => {
					if (entry.type === 'income') this.balances.totalIncomes += entry.amount;
					if (entry.type === 'expense') this.balances.totalExpenses += entry.amount;
				});

				this.balances.totalBalance = this.balances.totalIncomes - this.balances.totalExpenses;
			},

			// Formatting Methods
			formatDate(date) {
				if (new Date().getDate() === date.getDate() && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear()) return `Today`;
				else if (new Date().getDate() - 1 === date.getDate() && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear()) return 'Yesterday';
				else if (new Date().getDate() - date.getDate() >= 2 && new Date().getDate() - date.getDate() < 7 && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear()) {
					for (let i = 2; i <= 6; i++) {
						if (new Date().getDate() - i === date.getDate() && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear()) return `${i} days ago`;
					}
				} else return new Intl.DateTimeFormat(navigator.language).format(date);
			},

			formatAmount(amount) {
				return amount ? new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' }).format(amount) : '$0.00';
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
				this.entry = { id: String, date: Date, type: '', title: '', amount: 0, description: '' };
				this.showModal = this.showEditModal = false;
			},

			// Other methods
			updateStorage() {
				localStorage.setItem('entries', JSON.stringify(this.entries));
				localStorage.setItem('balances', JSON.stringify(this.balances));
			},
		},
	};
</script>

<style>
	.entries__screen {
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

	.entries__screen h1 {
		font-size: 48px;
		font-weight: 500;
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
		margin: 30px auto 20px auto;
	}

	.entries__container {
		background: white;
		border-radius: 0.5rem;

		display: flex;
		flex-direction: column;
		justify-content: space-between;

		overflow-x: hidden;
		overflow-y: auto;
	}

	.entries__container::-webkit-scrollbar {
		width: 10px;
	}
	.entries__container::-webkit-scrollbar-thumb {
		background: rgb(170, 170, 170);
		border-radius: 1rem;
	}
	.entries__container::-webkit-scrollbar-thumb:hover {
		background: rgb(128, 128, 128);
	}

	.entries__list {
		text-align: left;

		height: 100%;
		padding: 0 10px;

		position: relative;

		list-style: none;
	}

	.entry {
		background: white;
		border-radius: 5px;
		box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.6);

		width: 98%;
		padding: 10px 5px;
		margin-bottom: 10px;

		display: grid;
		grid-template-columns: 1fr max-content;
		grid-template-rows: max-content 1fr;
	}

	.entry.entry__income {
		background: rgb(155, 255, 155);
	}
	.entry.entry__expense {
		background: rgb(255, 155, 155);
	}

	.entry .entry__info {
		width: 100%;

		display: flex;
		align-items: center;
	}

	.entry .entry__date {
		background: rgb(224, 224, 224);
		border-radius: 1rem;
		box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.8);

		font-family: 'Source Sans Pro', sans-serif;
		font-size: 14px;
		text-transform: uppercase;
		text-align: center;

		height: fit-content;
		width: 100px;
		padding: 1px 4px;
	}
	.entry .entry__title {
		font-size: 18px;
		font-weight: 600;

		width: 100%;
		margin-left: 5px;

		overflow: hidden;
	}
	.entry .entry__amount {
		text-align: right;
		font-size: 18px;

		margin-right: 5px;

		justify-self: flex-end;
	}
	.entry .entry__description {
		color: black;
		border-top: 1px solid rgba(122, 122, 122, 0.5);

		margin-top: 5px;
		padding-top: 2px;

		grid-column: 1 / 3;
	}

	.entry .entry__buttons {
		display: flex;
	}

	.entry .entry__buttons button {
		background: rgb(245, 245, 245);
		outline: none;
		border: 1px solid rgba(128, 128, 128, 0.6);
		border-radius: 5px;
		box-shadow: 0px 1px 2px black;

		margin: 0 2px;

		transition: background 250ms ease;

		cursor: pointer;
	}

	.entry .entry__buttons button:hover {
		background: rgb(204, 204, 204);
	}
	.entry .entry__buttons button:active {
		background: rgb(173, 173, 173);
	}

	.add__entry--btn {
		background: rgb(245, 245, 245);
		outline: none;
		border: 2px solid rgba(0, 0, 0, 0.6);
		border-radius: 0.5rem;

		font-family: 'Roboto Slab', serif;
		font-size: 20px;
		font-weight: 500;

		width: fit-content;
		padding: 15px;
		margin-top: 75px;

		cursor: pointer;

		transition: all 150ms ease-in;
	}

	.add__entry--btn:hover,
	.add__entry--btn:active {
		background: rgb(216, 216, 216);
		transform: scale(1.1);
	}

	.balance__container h2 {
		margin: 10px 0;
	}

	.balance__container p {
		font-size: 16px;
		margin: 0;
		margin-bottom: 30px;
	}

	.balance__container h2#total__balance {
		background-clip: text;
		background: -webkit-linear-gradient(270deg, rgba(203, 203, 203) 0%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.balance__container h2#total__incomes {
		background-clip: text;
		background: -webkit-linear-gradient(270deg, #29c237 20%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.balance__container h2#total__expenses {
		background-clip: text;
		background: -webkit-linear-gradient(270deg, #c22929 20%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
