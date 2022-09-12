<script lang="ts">
	import { writable } from 'svelte/store';

	const payload = writable();
	const login = writable('');

	const onSendClick = async (): Promise<void> => {
		await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				login: $login
			})
		});
	};

	const onReadClick = async (): Promise<void> => {
		const response = await fetch('/api/me');
		$payload = await response.json();
	};
</script>

<div class="form">
	<span>Loing</span>
	<input bind:value={$login} />
	<br />
	<span>Payload</span>
	<textarea>{JSON.stringify($payload)}</textarea>
	<button on:click={onSendClick}>send</button>
	<button on:click={onReadClick}>read</button>
</div>

<style>
	:global(body) {
		height: 100vh;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		align-content: center;
	}

	.form {
		width: 500px;
	}
	textarea {
		width: 100%;
		height: 100px;
		border: 1px solid gray;
	}
</style>
