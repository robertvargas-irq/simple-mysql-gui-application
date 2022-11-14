function toggle_button() {
    const sel = document.getElementById('filter').value;
    const sub = document.getElementById('filter-submit');
    if (sel.length) {
        sub.textContent = '🔎 Go!';
        sub.disabled = false;
    }
    else {
        sub.textContent = '🔎 Select an option first'
        sub.disabled = true;
    }
}