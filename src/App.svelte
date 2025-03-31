<script lang="ts">
  import { onMount } from 'svelte';
  import FileUpload from './lib/FileUpload.svelte';
  import JsonViewer from './lib/JsonViewer.svelte';

  let jsonData: any = null;
  let expandAll = false;
  let jQ;
  let errorMessage: string | null = null;
  let errorReason: string | null = null;

  function handleJsonLoaded(event: CustomEvent) {
    jsonData = event.detail;
    errorMessage = null;
    errorReason = null;
  }

  onMount(() => {
    jQ = window.$;
    jQ(document).foundation();

    // Check for shared key in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedKey = urlParams.get('sharedKey');

    if (sharedKey) {
      try {
        const storedData = localStorage.getItem(sharedKey);
        if (storedData) {
          jsonData = JSON.parse(storedData);
        }
      } finally {
        localStorage.removeItem(sharedKey); // Clean up local storage
      }
    }

    // Check if we were opened with an error parameter
    const error = urlParams.get('error');
    if (error === 'share-failed') {
      errorMessage = 'Failed to process shared content';
      errorReason = urlParams.get('reason');
    }
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
          <p>{errorMessage}
            {#if errorReason}
              (Reason: {errorReason})
            {/if}
          </p>
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
