<template>
	<flux-grid
		:rows="rows"
		:cols="cols"
		:size="size"
		:image="from"
		ref="grid">
	</flux-grid>
</template>

<script>
	import BaseTransition from '@/mixins/BaseTransition.js';
	import FluxGrid from '@/components/FluxGrid.vue';

	export default {
		name: 'transitionBlocks1',

		components: {
			FluxGrid,
		},

		mixins: [
			BaseTransition,
		],

		data: () => ({
			rows: 8,
			cols: 8,
			tileDuration: 300,
			totalDuration: 0,
			easing: 'linear',
			tileDelay: 1000,
		}),

		created() {
			let divider = this.size.width / this.cols;
			this.rows = Math.floor(this.size.height / divider);

			this.totalDuration = this.tileDelay + this.tileDuration;
		},

		mounted() {
			this.$refs.grid.transform((tile, i) => {
				tile.transform({
					transition: `all ${this.tileDuration}ms ${this.easing} ${this.getDelay(i)}ms`,
					opacity: '0',
					transform: 'scale(0.4, 0.4)',
				});
			});
		},

		methods: {
			getDelay() {
				let delay = Math.random() * this.tileDelay;

				return Math.floor(delay);
			},
		},
	};
</script>
