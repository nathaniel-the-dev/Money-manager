<template>
	<div class="home__screen">
		<div class="greeting">
			<h1>{{ greetingMessage }}</h1>
			<h2>{{ greetingDate }}</h2>
			<h3>{{ greetingTime }}</h3>
		</div>

		<div class="summary--panel">
			<div class="entries--panel">
				<h1>Entries</h1>

				<div class="entries--summary">
					<transition name="fade" mode="out-in">
						<h2 v-if="!Entries.length" class="errMessage">No entries found.</h2>

						<div class="entry--list--container" v-else>
							<ul class="entries--list">
								<li class="summary--entry clickable" v-for="entry in Entries" :key="entry.id" :class="{ entry__income: entry.type === 'income', entry__expense: entry.type === 'expense' }" @click="$emit('switchToEntry', entry.id)">
									<span class="entry__summary__date">{{ formatDate(entry.date) }}</span>
									<div class="entry__summary__info">
										<span class="entry__summary__title">{{ entry.title }}</span>
										<span class="entry__summary__amount">{{ formatAmount(entry.amount) }}</span>
									</div>
									<div class="entry__summary__description" v-if="entry.description">{{ formatDescription(entry.description) }}</div>
								</li>
							</ul>

							<div class="balance--summary">
								<div class="balance__data" id="totalBalances">
									<span class="balance__amount">{{ formatAmount(Balances.totalBalance) }}</span>
								</div>
								<div class="balance__data" id="totalIncomes">
									<span class="balance__amount">{{ formatAmount(Balances.totalIncomes) }}</span>
								</div>
								<div class="balance__data" id="totalExpenses">
									<span class="balance__amount">{{ formatAmount(Balances.totalExpenses) }}</span>
								</div>
							</div>
						</div>
					</transition>
				</div>
			</div>

			<div class="reminders--panel">
				<h1>Reminders</h1>

				<div class="reminders--summary">
					<transition name="fade" mode="out-in">
						<h2 v-if="Reminders.length === 0" class="errMessage">No reminders found.</h2>

						<ul v-else class="reminders--list">
							<li class="summary--reminder clickable" v-for="reminder in Reminders" :key="reminder.id" @click="$emit('switchToReminder', [reminder.id, reminder.type])">
								<div class="reminder__summary__type" :class="`reminder__${reminder.type}`">{{ reminder.type }}</div>

								<div class="reminder__summary__info">
									<div class="reminder__summary__title">{{ reminder.title }}</div>

									<div class="reminder__summary__time">
										<span>
											{{ formatReminderDate(reminder.time) }}
										</span>
										<span>{{ formatReminderTime(reminder.time) }}</span>
									</div>
								</div>

								<div class="reminder__summary__desc" v-if="reminder.description">{{ reminder.description }}</div>
							</li>
						</ul>
					</transition>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Home',

		data() {
			return {
				// Date variables
				now: new Date(),
				ToD: new Date().getHours(),

				//Summary variables
				Entries: [],
				Balances: {},
				Reminders: [],
			};
		},

		mounted() {
			// Set date and time
			setInterval(() => (this.now = new Date()), 1000);
		},

		beforeUpdate() {
			// Load summary data
			this.loadData();
		},

		methods: {
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

			formatReminderDate(date) {
				return new Intl.DateTimeFormat(navigator.language, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
			},

			formatReminderTime(time) {
				return new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric' }).format(time);
			},

			formatAmount(amount) {
				return amount ? new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' }).format(amount) : '$0.00';
			},

			formatDescription(description) {
				if (description.length > 100) return description.slice(0, 50).padEnd(53, '.');
				else return description;
			},

			// Other methods
			loadData() {
				this.Entries = JSON.parse(localStorage.getItem('entries'));
				this.Entries.forEach((entry) => (entry.date = new Date(entry.date)));
				this.Balances = JSON.parse(localStorage.getItem('balances'));
				this.Reminders = JSON.parse(localStorage.getItem('reminders'));
				this.Reminders.forEach((rem) => (rem.time = new Date(rem.time)));
			},
		},

		computed: {
			greetingMessage() {
				if (this.ToD >= 0 && this.ToD < 12) return 'Good Morning';
				if (this.ToD >= 12 && this.ToD < 17) return 'Good Afternoon';
				if (this.ToD >= 17 && this.ToD < 19) return 'Good Evening';
				if (this.ToD >= 19) return 'Good Night';
			},

			greetingDate() {
				return new Intl.DateTimeFormat(navigator.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(this.now);
			},

			greetingTime() {
				return new Intl.DateTimeFormat(navigator.language, { hour: 'numeric', minute: 'numeric' }).format(this.now);
			},
		},
	};
</script>

<style scoped>
	/* Main */
	.home__screen {
		color: white;
		font-family: 'Roboto Slab', serif;
		text-align: center;

		display: flex;
		flex-direction: column;
		align-items: center;

		overflow: hidden;
	}

	/* Greeting Message */
	.greeting {
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}

	.greeting h1 {
		font-size: 48px;
		font-weight: 500;
		margin: 30px auto 20px auto;
	}
	.greeting h2 {
		font-size: 28px;
		font-weight: 400;
		margin: 10px auto;
	}
	.greeting h3 {
		font-size: 22px;
		font-weight: 400;
		margin: 5px auto;
	}

	/* Summary */
	.summary--panel {
		width: 90%;
		display: flex;
		justify-content: space-around;
	}

	.entries--panel,
	.reminders--panel {
		color: black;

		width: 30vw;
		height: 70vh;

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.entries--panel h1,
	.reminders--panel h1 {
		color: white;
		font-size: 24px;
		font-weight: 500;
		text-decoration: underline;
		text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
		letter-spacing: 0.5px;

		margin: 0 0 20px 0;
	}

	.entries--summary,
	.reminders--summary {
		background: rgba(255, 255, 255, 0.6);
		border-radius: 3px;
		box-shadow: 4px 4px 15px 5px rgba(0, 0, 0, 0.25);

		width: 100%;
		height: 85%;
		padding: 5px 0;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;

		position: relative;
	}

	.entry--list--container {
		height: 100%;
		width: 100%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}

	.entries--list {
		list-style: none;

		width: 90%;
		padding: 5px 10px;

		flex: auto;

		position: relative;

		overflow-x: hidden;
		overflow-y: auto;
	}

	.entries--list::-webkit-scrollbar {
		width: 10px;
	}
	.entries--list::-webkit-scrollbar-thumb {
		background: rgb(167, 167, 167);
		border-radius: 1rem;
	}
	.entries--list::-webkit-scrollbar-thumb:hover {
		background: rgb(153, 153, 153);
	}

	.summary--entry {
		background: white;
		border-radius: 3px;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

		text-align: left;
		line-height: 22.5px;

		margin: 15px auto;
		padding: 5px 5px 5px 10px;

		position: relative;

		overflow: hidden;
		transition: transform 200ms ease;
	}

	.clickable {
		cursor: pointer;
	}
	.clickable:hover {
		transform: scale(1.05);
	}

	.summary--entry.entry__income:before,
	.summary--entry.entry__expense:before {
		content: '';

		width: 5px;
		height: 100%;

		position: absolute;
		top: 0;
		left: 0;
	}
	.summary--entry.entry__income:before {
		background: linear-gradient(to bottom, rgba(20, 176, 45, 0.5) 0%, #14b02d 100%);
	}
	.summary--entry.entry__expense:before {
		background: linear-gradient(to bottom, rgba(176, 20, 20, 0.5) 0%, #b01414 100%);
	}

	.entry__summary__date {
		font-family: 'Source Sans Pro', sans-serif;
		font-size: 15px;
		font-weight: 400;
		text-transform: uppercase;
	}
	.entry__summary__info {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.entry__summary__title {
		font-size: 18px;
		font-weight: 500;
		text-transform: capitalize;
	}
	.entry__summary__amount {
		font-size: 18px;
		font-weight: 400;
		text-align: right;
	}
	.entry__summary__description {
		font-size: 16px;
		font-weight: 400;
		word-wrap: normal;
		margin-top: 10px;
	}

	.balance--summary {
		width: 100%;
		padding: 10px 0;
		margin-bottom: 10px;

		flex: content;
		justify-self: flex-end;

		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}

	.balance__data {
		font-size: 0.9em;
		font-weight: 400;
	}

	.balance__data#totalBalances:before {
		content: 'Total: ';
		background-clip: text;
		background: -webkit-linear-gradient(270deg, rgba(203, 203, 203) 0%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.balance__data#totalIncomes:before {
		content: 'Inc: ';
		background-clip: text;
		background: -webkit-linear-gradient(270deg, #29c237 20%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.balance__data#totalExpenses:before {
		content: 'Exp: ';
		background-clip: text;
		background: -webkit-linear-gradient(270deg, #c22929 20%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.balance__amount {
		color: black;
		font-size: 18px;
		font-weight: 500;
	}

	/* Reminders Summary */
	.reminders--list {
		width: 85%;
		margin: 0;
		padding: 5px 10px;

		list-style: none;

		position: relative;

		overflow-y: auto;
		overflow-x: hidden;
	}
	.reminders--list::-webkit-scrollbar {
		width: 10px;
	}
	.reminders--list::-webkit-scrollbar-thumb {
		background: rgb(167, 167, 167);
		border-radius: 1rem;
	}
	.reminders--list::-webkit-scrollbar-thumb:hover {
		background: rgb(153, 153, 153);
	}

	.summary--reminder {
		background: white;
		border-radius: 3px;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

		text-align: left;

		margin: 10px auto;
		padding: 5px;

		display: flex;
		flex-direction: column;

		overflow: hidden;
		transition: transform 200ms ease;
	}

	.summary--reminder .reminder__summary__info {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.summary--reminder .reminder__summary__type {
		color: rgb(50, 50, 50);
		border-radius: 1rem;

		font-family: 'Source Sans Pro', sans-serif;
		font-size: 16px;
		text-transform: capitalize;

		width: fit-content;
		height: fit-content;
		padding: 2px 5px;
	}
	.summary--reminder .reminder__summary__type.reminder__pending {
		background: rgba(190, 190, 190, 0.8);
	}
	.summary--reminder .reminder__summary__type.reminder__active {
		background: rgba(145, 255, 145, 0.8);
	}
	.summary--reminder .reminder__summary__type.reminder__complete {
		background: rgba(255, 221, 128, 0.8);
	}

	.summary--reminder .reminder__summary__title {
		font-size: 20px;
		font-weight: 400;
		text-transform: capitalize;

		padding-left: 3px;
	}

	.summary--reminder .reminder__summary__time {
		font-size: 16px;
		text-align: right;

		display: flex;
		flex-direction: column;
	}

	.summary--reminder .reminder__summary__desc {
		padding-left: 5px;
	}
</style>
