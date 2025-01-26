<script lang="ts">
  import { onMount } from 'svelte';
  // When a new prop is added, make sure to pass it through in the recursive components!
  export let jQ;
  export let data: any;
  export let expandAll = false;

  let accordionElement;

  enum DisplayMode {
    Inline = 'inline',
    Table = 'table',
    Accordion = 'accordion',
    Reveal = 'reveal',
    Card = 'card'
  }

  function isImageUrl(value: string): boolean {
    return typeof value === 'string' && value.match(/\.(jpg|jpeg|png|gif)$/i) !== null;
  }

  function isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  function isArray(value: any): boolean {
    return Array.isArray(value);
  }

  function getDisplayMode(value: any): DisplayMode {
    if (!isObject(value)) {
      if (typeof value === 'string' && isImageUrl(value)) {
        return DisplayMode.Reveal;
      }
      return DisplayMode.Inline;
    }

    if (isArray(value)) {
      const hasIds = value.length > 0 && typeof value[0] === 'object' && 'id' in value[0];
      return hasIds ? DisplayMode.Accordion : DisplayMode.Card;
    }

    // Check if object has any nested objects
    const hasNestedObjects = Object.values(value).some(v => isObject(v));
    return hasNestedObjects ? DisplayMode.Accordion : DisplayMode.Table;
  }

  function splitObjectEntries(obj: any): { simple: [string, any][]; complex: [string, any][] } {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        if (isObject(value)) {
          acc.complex.push([key, value]);
        } else {
          acc.simple.push([key, value]);
        }
        return acc;
      },
      { simple: [], complex: [] }
    );
  }

  function loadImage(event: Event) {
    const button = event.target as HTMLButtonElement;
    const url = button.dataset.url;
    const container = button.parentElement;
    
    if (url && container) {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'image-preview';
      container.appendChild(img);
      button.style.display = 'none';
    }
  }

  function toggleAccordions(expand) {
    if(!accordionElement) return;
    const accordionJQ = jQ(accordionElement);
    const items = accordionJQ.find('>.accordion-item>.accordion-content');
    accordionJQ.foundation((expand? 'down': 'up'), items);
  }

  const mode = getDisplayMode(data);

  $: toggleAccordions(expandAll);

  onMount(() => {
    jQ(document).foundation();
  });
</script>

<div class="json-viewer">
  {#if mode === DisplayMode.Inline}
    {data}
  {:else if mode === DisplayMode.Reveal}
    <button 
      class="button small"
      data-url={data}
      on:click={loadImage}
    >
      Load Image
    </button>
  {:else if mode === DisplayMode.Table}
    <table>
      {#each Object.entries(data) as [key, value]}
        <tr>
          <th>{key}:</th>
          <td>
            <svelte:self {jQ} data={value} {expandAll} />
          </td>
        </tr>
      {/each}
    </table>
  {:else if mode === DisplayMode.Card}
    <div class="grid-x grid-margin-x">
      {#each data as item}
        <div class="cell medium-6 large-4">
          <div class="card">
            <div class="card-section">
              <svelte:self {jQ} data={item} {expandAll} />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if mode === DisplayMode.Accordion}
    {#if !isArray(data)}
      {@const { simple, complex } = splitObjectEntries(data)}
      {#if simple.length > 0}
        <table>
          {#each simple as [key, value]}
            <tr>
              <th>{key}:</th>
              <td>
                <svelte:self {jQ} data={value} {expandAll} />
              </td>
            </tr>
          {/each}
        </table>
      {/if}
      {#if complex.length > 0}
        <div data-accordion-group>
          <ul class="accordion" data-accordion data-allow-all-closed="true" bind:this={accordionElement}>
            {#each complex as [key, value]}
              <li class="accordion-item" data-accordion-item>
                <a href="#" class="accordion-title">{key}</a>
                <div class="accordion-content" data-tab-content>
                  <svelte:self {jQ} data={value} {expandAll} />
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {:else}
      <div data-accordion-group>
        <ul class="accordion" data-accordion data-allow-all-closed="true">
          {#each data as item}
            <li class="accordion-item" data-accordion-item>
              <a href="#" class="accordion-title">{item.id}</a>
              <div class="accordion-content" data-tab-content>
                <svelte:self {jQ} data={item} {expandAll} />
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</div>