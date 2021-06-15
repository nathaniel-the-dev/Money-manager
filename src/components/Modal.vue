<template>
	<div class="overlay">
		<div class="modal">
			<slot name="entriesForm"></slot>
			<slot name="remindersForm"></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Modal',
	};
</script>

<style>
	.overlay {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);

		width: 100%;
		height: 100%;

		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal {
		border-radius: 1rem;

		height: fit-content;
		width: 45%;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.entry__form,
	.reminder__form {
		background: white;
		border-radius: 0.5rem;

		font-family: 'Roboto Slab', serif;
		text-align: left;

		width: 100%;
		margin: 10px;
		padding: 15px;

		display: flex;
		flex-direction: column;
	}
	.entry__form input::-webkit-outer-spin-button,
	.entry__form input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.entry__form h2,
	.reminder__form h2 {
		color: rgb(77, 77, 77);
		font-size: 28px;
		font-weight: 500;
		text-align: center;
		text-decoration: underline grey;

		margin: 0;
		margin-bottom: 20px;
	}

	.entry__form label,
	.reminder__form label {
		color: rgb(66, 66, 66);
		font-size: 18px;
		font-weight: 600;
		letter-spacing: 0.5px;

		margin-top: 10px;
	}

	.entry__form input,
	.entry__form select,
	.entry__form textarea,
	.reminder__form input,
	.reminder__form select,
	.reminder__form textarea {
		color: rgb(0, 0, 0);
		background: rgb(199, 199, 199);
		border: none;
		outline: none;
		border-radius: 3px;
		border-bottom: 1px solid silver;

		font-family: 'Roboto Slab', serif;
		font-size: 1.1em;
		font-weight: 300;

		padding: 2px;
		margin: 5px 0 10px 0;

		resize: none;
	}
	.entry__form input:focus,
	.entry__form select:focus,
	.entry__form textarea:focus,
	.reminder__form input:focus,
	.reminder__form select:focus,
	.reminder__form textarea:focus {
		background: rgb(179, 179, 179);
	}

	.entry__form .entry__description--input,
	.reminder__form .reminder__description--input {
		font-size: 16px;
		height: 100px;
	}

	.entry__form .modal__buttons,
	.reminder__form .modal__buttons {
		align-self: flex-end;
		display: flex;
	}

	.modal__buttons button {
		color: rgb(70, 70, 70);
		background: rgb(199, 199, 199);
		border: none;
		outline: none;
		border-radius: 5px;
		box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.5);

		font-family: 'Source Sans Pro';
		font-size: 1.1em;
		font-weight: 600;

		height: 30px;
		padding: 5px 10px;

		cursor: pointer;
		transition: background 200ms;
	}

	.modal__buttons .submit__btn {
		margin-right: 10px;
	}

	.modal__buttons .submit__btn:hover,
	.modal__buttons .submit__btn:active {
		background: rgb(155, 255, 163);
	}

	.modal__buttons .reset__btn:hover,
	.modal__buttons .reset__btn:active {
		background: rgb(252, 166, 166);
	}
</style>
