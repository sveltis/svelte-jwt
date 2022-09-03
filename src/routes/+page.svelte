<script lang="ts">
  const onClick = async (): Promise<void> => {
    const response = await fetch('/api/login', {method: 'POST'});
    const data = await response.json();
    console.log({data});
  }
</script>
<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={onClick}>send</button>