export class CustomDropdown {
  constructor(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      throw new Error(
        `Dropdown container with selector "${selector}" not found.`
      );
    }

    this.options = {
      defaultValue: "Select a language",
      items: [],
      ...options,
    };

    this.render();
  }

  render() {
    const itemsHTML =
      this.options.items.length > 0
        ? this.options.items
            .map((item) => `<li class="dropdown-item">${item}</li>`)
            .join("")
        : '<li class="dropdown-item">Loading...</li>';

    this.container.innerHTML = `
            <i class="fas fa-chevron-down"></i>
            <input type="text" class="dropdown-input" readonly value="${this.options.defaultValue}" />
            <ul class="dropdown-list">
                ${itemsHTML}
            </ul>
        `;

    this.setupElementsAndEvents();
  }

  setupElementsAndEvents() {
    this.input = this.container.querySelector(".dropdown-input");
    this.list = this.container.querySelector(".dropdown-list");
    this.chevron = this.container.querySelector(".fas");
    this.items = this.container.querySelectorAll(".dropdown-item");

    if (this.input) {
      this.input.addEventListener("click", this.toggleDropdown.bind(this));
    }

    if (this.items) {
      this.items.forEach((item) => {
        item.addEventListener("click", this.handleItemClick.bind(this));
      });
    }

    this.list.addEventListener("click", (event) => {
      const target = event.target;

      if (target.classList.contains("dropdown-item")) {
        // Dispatch custom 'change' event
        const changeEvent = new CustomEvent("change", {
          detail: { value: event.target.textContent },
        });
        this.container.dispatchEvent(changeEvent); // Dispatch on container
      }
    });
  }

  removeEventListenersFromItems() {
    if (this.items) {
      this.items.forEach((item) => {
        item.removeEventListener("click", this.handleItemClick);
      });
    }
    if (this.input) {
      this.input.removeEventListener("click", this.toggleDropdown);
    }
  }

  handleItemClick(event) {
    if (event.target.classList.contains("dropdown-item")) {
      this.setSelectedOption(event.target);
      this.list.classList.remove("show");
    }
  }

  toggleDropdown(e) {
    e.preventDefault();
    this.list.classList.toggle("show");
    this.chevron.classList.toggle("fa-chevron-up");
    this.chevron.classList.toggle("fa-chevron-down");
  }

  setSelectedOption(item) {
    this.items.forEach((i) => {
      i.classList.remove("selected");
      const existingCheck = i.querySelector(".fa-check");
      if (existingCheck) {
        existingCheck.remove();
      }
    });

    item.classList.add("selected");
    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fas", "fa-check");
    item.prepend(checkIcon);

    // Update the input value *after* re-rendering
    this.setInputValue(item.innerText);
  }

  setInputValue(value) {
    if (this.input) {
      this.input.value = value;
    }
  }
}
