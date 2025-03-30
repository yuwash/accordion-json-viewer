<script lang="ts">
  import { onMount } from 'svelte';
  import FileUpload from './lib/FileUpload.svelte';
  import JsonViewer from './lib/JsonViewer.svelte';

  let jsonData: any = null;
  let expandAll = false;
  let jQ;
  let errorMessage: string | null = null;

  function handleJsonLoaded(event: CustomEvent) {
    jsonData = event.detail;
    errorMessage = null;
  }

  function handleSharedJson(event: MessageEvent) {
    if (event.data.type === 'SHARED_JSON') {
      if (event.data.data.error) {
        errorMessage = event.data.data.error;
        jsonData = null;
      } else {
        jsonData = event.data.data;
        errorMessage = null;
      }
    }
  }

  onMount(() => {
    jQ = window.$;
    jQ(document).foundation();

    // Listen for shared JSON data
    navigator.serviceWorker?.addEventListener('message', handleSharedJson);

    // Check if we were opened with an error parameter
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error === 'share-failed') {
      errorMessage = 'Failed to process shared content';
    }

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSharedJson);
    };
  });
</script>

<svelte:head>
  <script>
    window.$ = $;
  </script>
</svelte:head>

<main class="grid-container">
  <div class="grid-x grid-padding-x">
    <div class="cell">
      <h1>JSON Viewer</h1>

      {#if errorMessage}
        <div class="callout alert">
          <p>{errorMessage}</p>
        </div>
      {/if}

      <FileUpload
        jQ={jQ}
        on:jsonLoaded={handleJsonLoaded}
        bind:expandAll
      />
      
      {#if jsonData && jQ}
        <JsonViewer 
          {jQ}
          data={jsonData}
          {expandAll}
        />
      {/if}
    </div>
  </div>
</main>