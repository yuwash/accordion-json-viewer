<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let jQ;
  export let expandAll = false;
  const expandAllLabel = 'Expand all';
  let textInput = '';
  let loadTextDropdownElement;

  const MAX_SIZE = 50000; // characters

  function validateSize(content: string): boolean {
    if (content.length > MAX_SIZE) {
      alert(`Content is too large. Maximum size is ${MAX_SIZE} characters.`);
      return false;
    }
    return true;
  }

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      try {
        const text = await file.text();
        if (!validateSize(text)) {
          input.value = ''; // Clear the input
          return;
        }
        const json = JSON.parse(text);
        dispatch('jsonLoaded', json);
      } catch (error) {
        alert('Error loading JSON file: ' + error);
        input.value = ''; // Clear the input
      }
    }
  }

  function handleTextInput() {
    try {
      if (!validateSize(textInput)) {
        return;
      }
      const json = (textInput === '')? null: JSON.parse(textInput);
      dispatch('jsonLoaded', json);
      textInput = '';
      // Close the dropdown
      if (loadTextDropdownElement) {
        jQ(loadTextDropdownElement).foundation('close');
      }
    } catch (error) {
      alert('Error parsing JSON: ' + error);
    }
  }
</script>

<div class="grid-x grid-margin-x align-middle">
  <div class="cell shrink">
    <label for="file-upload" class="button">Choose JSON file</label>
    <input 
      type="file" 
      id="file-upload" 
      accept=".json"
      on:change={handleFileUpload}
      style="display: none;"
    />
  </div>
  <div class="cell shrink">
    <button class="button" type="button" data-toggle="text-dropdown">
      Load from text
    </button>
    <div class="dropdown-pane" id="text-dropdown" data-dropdown data-auto-focus="true" bind:this={loadTextDropdownElement}>
      <div class="grid-x grid-margin-x">
        <div class="cell">
          <label>
            Paste JSON content
            <textarea 
              bind:value={textInput}
            ></textarea>
          </label>
        </div>
        <div class="cell">
          <button 
            class="button small"
            on:click={handleTextInput}
          >
            Load
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="cell shrink">
    <div class="switch tiny">
      <input 
        class="switch-input" 
        id="expandSwitch" 
        type="checkbox"
        bind:checked={expandAll}
      >
      <label class="switch-paddle" for="expandSwitch">
        <span class="show-for-sr">{expandAllLabel}</span>
      </label>
    </div>
  </div>
  <div class="cell shrink">
    <label for="expandSwitch" class="middle">{expandAllLabel}</label>
  </div>
</div>