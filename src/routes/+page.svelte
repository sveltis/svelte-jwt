<script lang="ts">
  import { writable } from "svelte/store";

  const token = writable('');
  const payload = writable<App.JWTPayload | undefined>();

  const onSendClick = async (): Promise<void> => {
    const response = await fetch('/api/login', {method: 'POST'});
    const data = await response.json();
    $token = data?.token;
  }

  const onReadClick = async (): Promise<void> => {
    const response = await fetch('/api/me', { 
        method: 'GET',
        headers: {
          Authorization: `Bearer ${$token}`
        }
      });
      $payload = await response.json();
  }
</script>

<div class="form">
  <span>JWT Token</span>
  <textarea>{$token}</textarea>
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

  .form { width: 500px; }
  textarea {width: 100%; height: 100px; border: 1px solid gray}
</style>