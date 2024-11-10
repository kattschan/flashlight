<script>
	import { onMount } from 'svelte'
	import { session } from '$lib/stores/session.js'
	import Chart from 'chart.js/auto/auto'
	import FakeAssignment from '$lib/components/FakeAssignment.svelte'
	import EditAssignment from '$lib/components/EditAssignment.svelte'

	export let data
	$: course = $session.selected.Courses.Course[data.courseIndex]

	let fakeAssignment
	let editAssignment

	let chartCanvas
	let chart
	let gradient

	// Function to sanitize NaN scores
	function sanitizeScores() {
		// Check for NaNs in chartData
		if (course && course.chartData) {
			course.chartData = course.chartData.map(point => ({
				...point,
				y: isNaN(point.y) ? 0 : point.y  // Replace NaN with 0 in y-values
			}));
		}

		// Check for NaNs in scoreTypes
		if (course && course.scoreTypes) {
			for (let key in course.scoreTypes) {
				let type = course.scoreTypes[key];
				type.score = isNaN(type.score) ? 0 : type.score;  // Replace NaN with 0 in score
				type.total = isNaN(type.total) ? 0 : type.total;  // Replace NaN with 0 in total
				type.scorePercent = isNaN(type.scorePercent) ? 0 : type.scorePercent;  // Replace NaN with 0 in scorePercent
			}
		}

		// Replace course-level NaNs
		course.score = isNaN(course.score) ? 0 : course.score;
		course.scorePercent = isNaN(course.scorePercent) ? 0 : course.scorePercent;
	}

	// Call sanitizeScores whenever course data updates
	$: if (course) {
		sanitizeScores();
	}

	$: if (course && chart) {
		chart.data.datasets[0].data = course.chartData

		gradient = chartCanvas
			.getContext('2d')
			.createLinearGradient(chart.chartArea.left, 0, chart.chartArea.right, 0)
		addColorStops(gradient)

		chart.options.scales.y.suggestedMax = course.fourPoint ? 4.0 : 100
		chart.options.scales.y.suggestedMin = course.fourPoint ? 1.0 : 60
		chart.update()
	}

	function getGradient(context) {
		const { ctx, chartArea } = context.chart
		if (!gradient && chartArea) {
			gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
			addColorStops(gradient)
		}
		return gradient
	}

	function addColorStops(gradient) {
		if (course.chartData.length === 0) {
			return
		}
		let first = course.chartData[0]
		let last = course.chartData[course.chartData.length - 1]
		let range = last.x - first.x
		if (range === 0) {
			gradient.addColorStop(0, first.color)
			gradient.addColorStop(1, first.color)
		} else {
			for (let point of course.chartData) {
				gradient.addColorStop((point.x - first.x) / range, point.color)
			}
		}
	}

	onMount(async () => {
		sanitizeScores()  // Ensure NaNs are cleared on mount
		Chart.defaults.font.family = 'Outfit'
		Chart.defaults.font.weight = 300
		Chart.defaults.font.size = 14
		Chart.defaults.color = getComputedStyle(chartCanvas).getPropertyValue('--font-color-2')
		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				datasets: [
					{
						borderColor: getGradient,
						tension: 0.3,
						data: course.chartData
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							title: function (value) {
								return new Date(value[0].raw.x * 8.64e7).toLocaleDateString(
									'en-US',
									{
										month: 'short',
										day: 'numeric',
										year: 'numeric',
										timeZone: 'UTC'
									}
								)
							},
							label: function (value) {
								return value.raw.y.toFixed(1) + (!course.fourPoint ? '%' : '')
							}
						}
					}
				},
				scales: {
					x: {
						type: 'linear',
						bounds: 'data',
						grid: {
							color: getComputedStyle(chartCanvas).getPropertyValue('--bg-color-3')
						},
						ticks: {
							precision: 0,
							callback: function (value) {
								return new Date(value * 8.64e7).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									timeZone: 'UTC'
								})
							}
						}
					},
					y: {
						type: 'linear',
						suggestedMax: course.fourPoint ? 4.0 : 100,
						suggestedMin: course.fourPoint ? 1.0 : 60,
						grid: {
							color: getComputedStyle(chartCanvas).getPropertyValue('--bg-color-3')
						}
					}
				}
			}
		})
	})
</script>
