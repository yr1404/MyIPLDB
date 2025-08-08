document.addEventListener('DOMContentLoaded', (e)=>{
    const splash = document.querySelector('.splash');
    setTimeout(() => {
        splash.classList.add('display-none');
    }, 2000);
})