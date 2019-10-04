import Img from '../libraries/Img'

export default class ImagesController {

	constructor(vf) {
		this.vf = vf;
		this.reset(true);
	}

	get previous() {
		let index = this.$current.index - 1;

		if (index < 0)
			index = this.imgs.length - 1;

		return this.imgs[index];
	}

	get last() {
		return this.$last;
	}

	set last(image) {
		this.$last = { ...image };
	}

	get current() {
		return this.$current;
	}

	set current(image) {
		if (this.$current)
			this.last = this.$current;

		this.$current = image;
	}

	get next() {
		let index = this.$current.index + 1;

		if (index >= this.imgs.length)
			index = 0;

		return this.imgs[index];
	}

	reset(hard = false) {
		if (hard)
			this.$last = undefined;

		this.srcs = [];
		this.imgs = [];

		this.loaded = 0;
		this.progress = 0;

		this.preloading = false;
		this.lazyloading = false;

		this.current = undefined;
	}

	update(images) {
		this.reset();

		this.time = Date.now().toString();
		this.srcs = images.slice(0);

		this.preloadStart();
	}

	preloadStart() {
		this.preloading = true;

		let preload = this.srcs.length;

		if (this.vf.config.lazyLoad)
			preload = this.vf.config.lazyLoadAfter;

		let srcs = this.srcs.slice(0, preload);
		srcs.forEach(src => this.addImg(src));

		this.vf.$emit('images-preload-start');
	}

	preloadEnd() {
		this.preloading = false;

		this.vf.$emit('images-preload-end');

		if (this.imgs.length < this.srcs.length)
			this.lazyLoadStart();

		else
			this.removeErrorImgs();

		this.vf.init();
	}

	lazyLoadStart() {
		this.lazyloading = true;

		let srcs = this.srcs.slice(this.imgs.length);
		srcs.forEach(src => this.addImg(src));

		this.vf.$emit('images-lazy-load-start');
	}

	lazyLoadEnd() {
		this.lazyloading = false;

		this.removeErrorImgs();

		this.vf.$emit('images-lazy-load-end');
	}

	addImg(src) {
		let img = new Img(src);
		this.imgs.push(img);

		img.load().then(() => {
			this.imgLoadSuccess();
		}).catch(error => {
			this.imgLoadError(error);
		});
	}

	imgLoadSuccess() {
		this.loaded++;

		if (!this.current) {
			for (let i = 0; i < this.imgs.length; i++) {
				let status = this.imgs[i].status;

				if (status === 'error')
					continue;

				if (status === 'loaded')
					this.last = this.current = this.imgs[i];

				break;
			}
		}

		if (this.preloading)
			this.updateProgress();

		if (this.loaded === this.imgs.length)
			this.preloading? this.preloadEnd() : this.lazyLoadEnd();
	}

	imgLoadError(error) {
		console.warn(error);
	}

	updateProgress() {
		this.progress = Math.ceil(this.loaded * 100 / this.imgs.length) || 0;
	}

	removeErrorImgs() {
		this.imgs = this.imgs.filter(img => img.status === 'loaded');

		this.imgs.forEach((img, index) => {
			img.index = index;
		});
	}

	getByIndex(index) {
		if (index === 'next')
			return this.next;

		if (index === 'previous')
			return this.previous;

		if (!this.imgs[index])
			throw new ReferenceError(`Image ${index} not found`);

		return this.imgs[index];
	}

}
