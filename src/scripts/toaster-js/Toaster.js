// Do not import this module to the application! Import index.js instead.

/**
 * @type {Toaster}
 */
export let toaster = new Toaster();

/**
 * Toasts controller. Controls toasts that appear on the screen.
 * @constructor
 * @private
 */
function Toaster () {

    /**
     * @type {Toast[]}
     */
    this.toasts = [];

	/**
     * Keeps the timeouts of toasts which are removed.
	 * @type {Map}
	 */
	this.timeouts = new Map();

}

/**
 * @param {Toast} toast
 * @param {number} timeout
 */
Toaster.prototype.push = function (toast,cat, timeout) {
	
    requestAnimationFrame(() => {

        let height = toast.attach(0,cat);

        this.toasts.forEach((toast) => {
            toast.seek(height);
        });
		this.toasts.push(toast);
		// added for sticky modals
		if (timeout != 0) {
			this.timeouts.set(toast, setTimeout(() => this.remove(toast), timeout));
		}
		else {
			this.timeouts.set(toast, 0);		
		}

    });

};

/**
 * @param {Toast} toast
 */
Toaster.prototype.remove = function (toast) {

	if (this.timeouts.has(toast)) {
		clearTimeout(this.timeouts.get(toast));
		this.timeouts.delete(toast);
	} else {
		return; // already deleted
	}

	const index = this.toasts.indexOf(toast);
	const tst = this.toasts.splice(index, 1)[0];
	const height = toast.element.offsetHeight;

	tst.detach();
	this.toasts.slice(0, index).forEach(t => t.seek(-height));

};

Toaster.prototype.removeAll = function () {
	while (this.toasts.length > 0)
		this.remove(this.toasts[0]);
};

Toaster.prototype.removeTop = function () {
	console.log('removing TOP toast!');

	if (this.toasts[1]) {
		this.remove(this.toasts[1]);
	}
	else {
		// looks like we only have 1 toast, so let's remove it instead
		this.remove(this.toasts[0]);
	}
};