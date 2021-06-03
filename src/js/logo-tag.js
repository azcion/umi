class LogoTag extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		fetch(this.getAttribute('src'))
			.then(response => response.text())
			.then(text => {
				this.innerHTML = text;
			});
	}
}

customElements.define('custom-svg', LogoTag);
