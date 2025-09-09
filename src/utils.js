export const formatNumber = (value) => {
	if(!value || isNaN(value)) {
		return value;
	}
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}