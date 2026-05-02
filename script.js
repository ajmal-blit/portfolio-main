document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.nav-bar');
    const sections = document.querySelectorAll('#home, #about, #projects, #experience, #education, #connect');
    const navLinks = document.querySelectorAll('.nav-bar ul li a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Mobile Menu Toggle logic
    const menuIcon = document.getElementById('menu-icon');
    const navList = document.querySelector('.nav-bar ul');
    
    if (menuIcon && navList) {
        const menuIconI = menuIcon.querySelector('i');
        
        menuIcon.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuIconI.classList.toggle('fa-bars');
            menuIconI.classList.toggle('fa-xmark');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                menuIconI.classList.add('fa-bars');
                menuIconI.classList.remove('fa-xmark');
            });
        });
    }

    // Typing animation for the main header
    const typeTarget = document.querySelector('.main-left-head');
    if (typeTarget) {
        const textToType = "Hi, I'm Ajmal Kx";
        typeTarget.textContent = ''; // Clears the text initially
        let charIndex = 0;

        function typeWriter() {
            if (charIndex < textToType.length) {
                typeTarget.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100); // 100ms delay between each keystroke
            }
        }
        
        setTimeout(typeWriter, 500); // Wait 0.5s before starting the animation
    }

    // Word-by-word fade in for About Me text
    const aboutText = document.querySelector('.about-subhead');
    if (aboutText) {
        const words = aboutText.textContent.trim().split(/\s+/);
        aboutText.innerHTML = words.map((word, index) => {
            // Add a staggered delay of 30ms for each word
            return `<span class="word" style="transition-delay: ${index * 30}ms">${word}</span>`;
        }).join(' ');
    }
});