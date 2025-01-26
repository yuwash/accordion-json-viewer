<script lang="ts">
  import { onMount } from 'svelte';
  import FileUpload from './lib/FileUpload.svelte';
  import JsonViewer from './lib/JsonViewer.svelte';

  let jsonData: any = null;
  let expandAll = false;
  let jQ;

  function handleJsonLoaded(event: CustomEvent) {
    jsonData = event.detail;
  }

  onMount(() => {
    jQ = window.$;
    jQ(document).foundation();
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