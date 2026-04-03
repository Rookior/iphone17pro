document.addEventListener('DOMContentLoaded', () => {
    // ---- 视频弹窗逻辑 (Video Modal Logic) ----
    const playBtn = document.getElementById('playVideoBtn');
    const videoModal = document.getElementById('videoModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const videoElement = document.getElementById('highlightsVideo');

    function openModal() {
        if (videoModal) {
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滚动

            if (videoElement) {
                videoElement.play().catch(error => {
                    console.log("Auto-play was prevented:", error);
                });
            }
        }
    }

    function closeModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            document.body.style.overflow = ''; // 恢复滚动

            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        }
    }

    if (playBtn) playBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);


    // ---- 轮播图逻辑 (Carousel Logic) ----
    const carouselTrack = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const playPauseBtn = document.getElementById('carouselPlayBtn');
    const playPausePath = document.getElementById('playPausePath');
    const indicatorsContainer = document.getElementById('carouselIndicators');

    if (carouselTrack && slides.length > 0) {
        const svgPlay = "M8,5 L19,12 L8,19 Z";
        const svgPause = "M6,19 L10,19 L10,5 L6,5 Z M14,19 L18,19 L18,5 L14,5 Z";

        let currentIndex = 0;
        let autoPlayInterval = null;
        let isPlaying = true; // 默认自动播放
        const totalSlides = slides.length;

        // 生成指示器 Dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetAutoPlay();
            });
            indicatorsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-dot');

        function updateCarousel() {
            // 计算位移：卡片宽度 + margin-right
            const style = window.getComputedStyle(slides[0]);
            const slideWidth = slides[0].offsetWidth + parseFloat(style.marginRight);
            const transformValue = -(slideWidth * currentIndex);

            carouselTrack.style.transform = `translateX(${transformValue}px)`;

            slides.forEach((s, idx) => {
                s.classList.toggle('active', idx === currentIndex);
                dots[idx].classList.toggle('active', idx === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            if (currentIndex < 0) currentIndex = totalSlides - 1;
            if (currentIndex >= totalSlides) currentIndex = 0;
            updateCarousel();
        }

        function playCarousel() {
            isPlaying = true;
            if (playPausePath) playPausePath.setAttribute('d', svgPause);
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 3000);
        }

        function pauseCarousel() {
            isPlaying = false;
            if (playPausePath) playPausePath.setAttribute('d', svgPlay);
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        function resetAutoPlay() {
            if (isPlaying) {
                pauseCarousel();
                playCarousel();
            }
        }

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                pauseCarousel();
            } else {
                playCarousel();
            }
        });

        // 窗口缩放时重新计算宽度
        window.addEventListener('resize', () => {
            updateCarousel();
        });

        // 初始化
        updateCarousel();
        playCarousel();
    }

    // ---- 机型比较弹窗逻辑 (Compare Modal Logic) ----
    const compareModal = document.getElementById('compareModal');
    const closeCompareBtn = document.getElementById('closeCompareModalBtn');
    const compareBackdrop = document.getElementById('compareModalBackdrop');

    // ---- 机型比较：连续卡片轮播逻辑 ----
    const compareTabs = document.querySelectorAll('.compare-tab');
    const allScrollers = document.querySelectorAll('.compare-modal .compare-cards-scroller');
    const prevBtn = document.querySelector('.compare-modal .prev-btn');
    const nextBtn = document.querySelector('.compare-modal .next-btn');

    // 从第一个 scroller 读取卡片总数和 module 映射
    const refScroller = allScrollers[0];
    const allCards = refScroller ? refScroller.querySelectorAll('.compare-feature-card') : [];
    const totalCards = allCards.length;
    let currentCardIndex = 0;

    // 获取某个 card index 对应的 module 名称
    function getModuleAtIndex(index) {
        if (!allCards[index]) return '';
        return allCards[index].getAttribute('data-module') || '';
    }

    // 获取某个 module 的第一个 card index
    function getFirstIndexOfModule(moduleName) {
        for (let i = 0; i < totalCards; i++) {
            if (getModuleAtIndex(i) === moduleName) return i;
        }
        return 0;
    }

    function scrollToCard(index) {
        currentCardIndex = Math.max(0, Math.min(index, totalCards - 1));
        allScrollers.forEach(scroller => {
            const card = scroller.querySelector('.compare-feature-card');
            if (!card) return;
            const gap = 16;
            const cardWidth = card.offsetWidth + gap;
            scroller.scrollTo({ left: cardWidth * currentCardIndex, behavior: 'smooth' });
        });
        // 同步 Tab 高亮
        const currentModule = getModuleAtIndex(currentCardIndex);
        compareTabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-tab-name') === currentModule);
        });
        // 更新按钮状态
        if (prevBtn) prevBtn.disabled = currentCardIndex <= 0;
        if (nextBtn) nextBtn.disabled = currentCardIndex >= totalCards - 1;
    }

    function openCompareModal(targetModule = 'design') {
        if (compareModal && compareBackdrop) {
            compareModal.classList.add('active');
            compareBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 跳转到目标模块的第一张卡片
            const idx = getFirstIndexOfModule(targetModule);
            setTimeout(() => {
                scrollToCard(idx);
            }, 50);
        }
    }

    function closeCompareModal() {
        if (compareModal && compareBackdrop) {
            compareModal.classList.remove('active');
            compareBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 绑定所有比较按钮
    const allCompareBtns = document.querySelectorAll('[data-compare-module]');
    allCompareBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const module = btn.getAttribute('data-compare-module');
            openCompareModal(module);
        });
    });

    if (closeCompareBtn) closeCompareBtn.addEventListener('click', closeCompareModal);
    if (compareBackdrop) compareBackdrop.addEventListener('click', closeCompareModal);

    // 箭头：逐卡切换
    if (prevBtn) {
        prevBtn.addEventListener('click', () => scrollToCard(currentCardIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => scrollToCard(currentCardIndex + 1));
    }

    // Tab 点击：跳到该模块的第一张卡片
    compareTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const moduleName = tab.getAttribute('data-tab-name');
            const idx = getFirstIndexOfModule(moduleName);
            scrollToCard(idx);
        });
    });

    // 初始化
    scrollToCard(0);

    // ---- 定睛细看：垂直探索器逻辑 ----
    const hotspotItems = document.querySelectorAll('.hotspot-item');
    const exploreImages = document.querySelectorAll('.explore-img');
    const upBtn = document.querySelector('.explore-arrow-btn.up');
    const downBtn = document.querySelector('.explore-arrow-btn.down');
    const mobilePrevBtn = document.querySelector('.explore-mobile-btn.prev');
    const mobileNextBtn = document.querySelector('.explore-mobile-btn.next');
    const mobileLabels = document.querySelectorAll('.mobile-label');
    let currentExploreIndex = 0;
    const totalExploreItems = hotspotItems.length;

    function updateExploreView(index) {
        if (index < 0 || index >= totalExploreItems) return;
        currentExploreIndex = index;

        // 更新 Hotspots 状态
        hotspotItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新图片状态
        exploreImages.forEach((img, i) => {
            if (i === index) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });

        // 更新按钮状态
        if (upBtn) upBtn.disabled = currentExploreIndex === 0;
        if (downBtn) downBtn.disabled = currentExploreIndex === totalExploreItems - 1;

        // 更新移动端按钮和标签
        if (mobilePrevBtn) mobilePrevBtn.disabled = currentExploreIndex === 0;
        if (mobileNextBtn) mobileNextBtn.disabled = currentExploreIndex === totalExploreItems - 1;

        mobileLabels.forEach((label, i) => {
            if (i === index) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }

    // 绑定点击事件给每一个 Hotspot Item
    hotspotItems.forEach((item, index) => {
        item.onclick = (e) => {
            updateExploreView(index);
        };
    });

    if (upBtn) {
        upBtn.onclick = () => {
            if (currentExploreIndex > 0) {
                updateExploreView(currentExploreIndex - 1);
            }
        };
    }

    if (downBtn) {
        downBtn.onclick = () => {
            if (currentExploreIndex < totalExploreItems - 1) {
                updateExploreView(currentExploreIndex + 1);
            }
        };
    }

    // 移动端左右切换逻辑
    if (mobilePrevBtn) {
        mobilePrevBtn.addEventListener('click', () => {
            if (currentExploreIndex > 0) {
                updateExploreView(currentExploreIndex - 1);
            }
        });
    }

    if (mobileNextBtn) {
        mobileNextBtn.addEventListener('click', () => {
            if (currentExploreIndex < totalExploreItems - 1) {
                updateExploreView(currentExploreIndex + 1);
            }
        });
    }

    mobileLabels.forEach((label) => {
        label.addEventListener('click', () => {
            const labelIndex = parseInt(label.getAttribute('data-index'));
            if (!isNaN(labelIndex)) {
                updateExploreView(labelIndex);
            }
        });
    });

    // 初始显示第一项
    updateExploreView(0);

    // ---- 性能视频：滚动触发播放逻辑 ----
    const perfSection = document.getElementById('performanceHeroSection');
    const perfVideo = document.getElementById('performanceVideo');
    const perfImage = document.getElementById('performanceImage');

    if (perfSection && perfVideo && perfImage) {
        let perfVideoPlayed = false;

        // 视频播放结束后，淡出视频，淡入图片
        perfVideo.addEventListener('ended', () => {
            perfVideo.classList.add('ended');
            perfImage.classList.add('visible');
        });

        // 使用 IntersectionObserver 检测滚动到视口
        const perfObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !perfVideoPlayed) {
                    perfVideoPlayed = true;
                    perfVideo.play().catch(() => {
                        // 如果自动播放失败，直接显示图片
                        perfVideo.classList.add('ended');
                        perfImage.classList.add('visible');
                    });
                    perfObserver.disconnect();
                }
            });
        }, {
            threshold: 0.3 // 30% 可见时触发
        });

        perfObserver.observe(perfSection);
    }

    // ---- 设计视频：自动播放结束后显示图片 ----
    const chassisVideo = document.querySelector('.chassis-video');
    const chassisImage = document.querySelector('.chassis-image');

    if (chassisVideo && chassisImage) {
        // 视频播放结束后，隐藏视频并显示图片
        chassisVideo.addEventListener('ended', () => {
            chassisVideo.classList.add('hidden');
            chassisImage.classList.add('visible');
        });

        // 如果视频无法自动播放，直接显示图片
        chassisVideo.addEventListener('error', () => {
            chassisVideo.style.display = 'none';
            chassisImage.classList.add('visible');
        });
    }

    // ---- 主图视频：自动播放结束后显示图片 ----
    const heroVideo = document.querySelector('.hero-video');
    const heroImage = document.querySelector('.hero-image');

    if (heroVideo && heroImage) {
        // 视频播放结束后，隐藏视频并显示图片
        heroVideo.addEventListener('ended', () => {
            heroVideo.classList.add('hidden');
            heroImage.classList.add('visible');
        });

        // 如果视频无法自动播放，直接显示图片
        heroVideo.addEventListener('error', () => {
            heroVideo.style.display = 'none';
            heroImage.classList.add('visible');
        });
    }

    // ---- 摄像头视频：自动播放结束后显示图片 ----
    const cameraSection = document.querySelector('.camera-detail-section');
    const cameraVideo = document.getElementById('cameraDetailVideo');
    const cameraImage = document.getElementById('cameraDetailImage');

    if (cameraSection && cameraVideo && cameraImage) {
        let cameraVideoPlayed = false;

        cameraVideo.addEventListener('ended', () => {
            cameraVideo.classList.add('ended');
            cameraImage.classList.add('visible');
        });

        const cameraObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !cameraVideoPlayed) {
                    cameraVideoPlayed = true;
                    cameraVideo.play().catch(() => {
                        cameraVideo.classList.add('ended');
                        cameraImage.classList.add('visible');
                    });
                    cameraObserver.disconnect();
                }
            });
        }, {
            threshold: 0.3
        });

        cameraObserver.observe(cameraSection);
    }

    // ---- 焦距选项卡切换逻辑 ----
    const focalTabs = document.querySelectorAll('.focal-tab');
    const focalImages = document.querySelectorAll('.focal-image');
    const focalDescriptions = document.querySelectorAll('.focal-description');
    const focalNavPrev = document.getElementById('focalNavPrev');
    const focalNavNext = document.getElementById('focalNavNext');

    if (focalTabs.length > 0) {
        let currentFocalIndex = 0;
        const totalFocalTabs = focalTabs.length;

        function setActiveFocal(focalValue, index, skipScroll = false) {
            currentFocalIndex = index !== undefined ? index : currentFocalIndex;

            // 更新选项卡状态
            focalTabs.forEach(tab => {
                tab.classList.toggle('active', tab.getAttribute('data-focal') === focalValue);
            });

            // 更新图片状态
            focalImages.forEach(img => {
                img.classList.toggle('active', img.getAttribute('data-focal') === focalValue);
            });

            // 更新描述状态
            focalDescriptions.forEach(desc => {
                desc.classList.toggle('active', desc.getAttribute('data-focal') === focalValue);
            });

            // 更新导航按钮状态
            if (focalNavPrev) focalNavPrev.disabled = currentFocalIndex === 0;
            if (focalNavNext) focalNavNext.disabled = currentFocalIndex === totalFocalTabs - 1;

            // 滚动高亮选项卡到可视区域（初始化时跳过）
            if (!skipScroll) {
                const activeTab = focalTabs[currentFocalIndex];
                if (activeTab) {
                    activeTab.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        }

        function goToFocalIndex(index) {
            if (index < 0 || index >= totalFocalTabs) return;
            const focalValue = focalTabs[index].getAttribute('data-focal');
            setActiveFocal(focalValue, index);
        }

        // 绑定选项卡点击事件
        focalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const focalValue = tab.getAttribute('data-focal');
                const index = parseInt(tab.getAttribute('data-index'));
                setActiveFocal(focalValue, index);
            });
        });

        // 绑定导航按钮事件
        if (focalNavPrev) {
            focalNavPrev.addEventListener('click', () => {
                goToFocalIndex(currentFocalIndex - 1);
            });
        }

        if (focalNavNext) {
            focalNavNext.addEventListener('click', () => {
                goToFocalIndex(currentFocalIndex + 1);
            });
        }

        // 初始化
        setActiveFocal(focalTabs[0].getAttribute('data-focal'), 0, true);
    }

    // ---- 镜头视频：自动播放结束后显示图片 ----
    const lensSection = document.querySelector('.lens-video-section');
    const lensVideo = document.getElementById('lensVideo');
    const lensImage = document.getElementById('lensImage');

    if (lensSection && lensVideo && lensImage) {
        let lensVideoPlayed = false;

        lensVideo.addEventListener('ended', () => {
            lensVideo.classList.add('ended');
            lensImage.classList.add('visible');
        });

        const lensObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !lensVideoPlayed) {
                    lensVideoPlayed = true;
                    lensVideo.play().catch(() => {
                        lensVideo.classList.add('ended');
                        lensImage.classList.add('visible');
                    });
                    lensObserver.disconnect();
                }
            });
        }, {
            threshold: 0.3
        });

        lensObserver.observe(lensSection);
    }

    // ---- 出片轮播图逻辑 ----
    const photoCarouselTrack = document.getElementById('photoCarouselTrack');
    const photoSlides = document.querySelectorAll('.photo-carousel-slide');
    const photoPrevBtn = document.getElementById('photoCarouselPrev');
    const photoNextBtn = document.getElementById('photoCarouselNext');

    if (photoCarouselTrack && photoSlides.length > 0) {
        let currentPhotoIndex = 0;
        const totalPhotoSlides = photoSlides.length;

        function updatePhotoCarousel() {
            const isMobile = window.innerWidth <= 768;
            const gap = isMobile ? 12 : 20;
            const slideWidth = photoSlides[0].offsetWidth + gap;
            const transformValue = -(currentPhotoIndex * slideWidth) + (photoCarouselTrack.parentElement.offsetWidth / 2 - slideWidth / 2);
            photoCarouselTrack.style.transform = `translateX(${transformValue}px)`;

            photoSlides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentPhotoIndex);
            });
        }

        function goToPhotoSlide(index) {
            currentPhotoIndex = Math.max(0, Math.min(index, totalPhotoSlides - 1));
            updatePhotoCarousel();
        }

        if (photoPrevBtn) {
            photoPrevBtn.addEventListener('click', () => {
                goToPhotoSlide(currentPhotoIndex - 1);
            });
        }

        if (photoNextBtn) {
            photoNextBtn.addEventListener('click', () => {
                goToPhotoSlide(currentPhotoIndex + 1);
            });
        }

        updatePhotoCarousel();

        window.addEventListener('resize', () => {
            updatePhotoCarousel();
        });
    }

    // ---- 拍照选项卡逻辑 ----
    const cameraTabBtns = document.querySelectorAll('.camera-tab-btn');
    const cameraTabContents = document.querySelectorAll('.camera-tab-content');
    const cameraDescriptions = document.querySelectorAll('.camera-description');
    const cameraTabVideos = document.querySelectorAll('.camera-tab-video');

    if (cameraTabBtns.length > 0) {
        function switchToCameraTab(index) {
            cameraTabBtns.forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });

            cameraTabContents.forEach((content, i) => {
                content.classList.toggle('active', i === index);
            });

            cameraDescriptions.forEach((desc, i) => {
                desc.classList.toggle('active', i === index);
            });

            cameraTabVideos.forEach((video, i) => {
                if (i === index) {
                    video.currentTime = 0;
                    video.play().catch(() => { });
                } else {
                    video.pause();
                }
            });
        }

        cameraTabBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                switchToCameraTab(index);
            });
        });

        switchToCameraTab(0);
    }

    // ---- Pro 视频滚动交互逻辑 ----
    const proVideoSection = document.getElementById('proVideoSection');
    const proVideo = document.getElementById('proVideo');
    const proVideoWrapper = document.getElementById('proVideoWrapper');
    const proVideoEndframe = document.getElementById('proVideoEndframe');
    const proVideoOverlayText = document.getElementById('proVideoOverlayText');
    const proVideoSticky = document.getElementById('proVideoSticky');

    if (proVideoSection && proVideo && proVideoWrapper && proVideoEndframe) {
        let proVideoPlayed = false;
        let proVideoEnded = false;
        let proVideoTicking = false;

        // 视频播放结束后，淡出视频，淡入结束帧图片
        proVideo.addEventListener('ended', () => {
            proVideoEnded = true;
            proVideo.classList.add('ended');
            proVideoEndframe.classList.add('visible');
        });

        // 使用 IntersectionObserver 检测滚动到视口时播放视频
        const proVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !proVideoPlayed) {
                    proVideoPlayed = true;
                    proVideo.play().catch(() => {
                        proVideoEnded = true;
                        proVideo.classList.add('ended');
                        proVideoEndframe.classList.add('visible');
                    });
                }
            });
        }, {
            threshold: 0.1
        });

        proVideoObserver.observe(proVideoSection);

        // 滚动驱动动画
        function updateProVideoScroll() {
            proVideoTicking = false;

            const sectionRect = proVideoSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionHeight = proVideoSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // 计算滚动进度：0 = section刚进入视口底部，1 = spacer滚动完毕
            // sticky元素固定在top:0，所以sectionTop从正值变到负值
            // 当sectionTop = 0时，sticky刚开始固定
            // 滚动距离 = sectionHeight - windowHeight (spacer的高度部分)
            const scrollableDistance = sectionHeight - windowHeight;

            if (scrollableDistance <= 0) return;

            // 当sectionTop <= 0 时，sticky已经固定，开始计算进度
            // progress: 0 = 刚固定, 1 = 即将离开
            let progress = 0;
            if (sectionTop <= 0) {
                progress = Math.min(1, Math.max(0, Math.abs(sectionTop) / scrollableDistance));
            }

            // ---- 视频缩放 ----
            // Phase 1: progress 0~0.6 → 视频从 scale(1) 缩小到 scale(0.6)
            const shrinkEnd = 0.6;
            let scale = 1;
            if (progress <= shrinkEnd) {
                const shrinkProgress = progress / shrinkEnd;
                scale = 1 - (0.4 * shrinkProgress); // 1 → 0.6
            } else {
                scale = 0.6;
            }

            proVideoWrapper.style.transform = `scale(${scale})`;

            // ---- 文字动画 ----
            if (proVideoOverlayText) {
                // progress < 0.3: 文字在中间，完全可见
                // progress 0.3~0.8: 文字从中间向上移动，逐渐消失
                // progress > 0.8: 文字在顶部，完全消失
                // 反向滚动时：文字从上方回到中间后停留显示
                const textAppearStart = 0.3;
                const textAppearEnd = 0.8;

                if (progress < textAppearStart) {
                    // 文字停留在中间，完全可见
                    proVideoOverlayText.style.opacity = '1';
                    proVideoOverlayText.style.transform = 'translate(-50%, -50%)';
                } else if (progress >= textAppearStart && progress <= textAppearEnd) {
                    // 文字从中间向上移动并逐渐消失
                    const textProgress = (progress - textAppearStart) / (textAppearEnd - textAppearStart);

                    // opacity: 1 → 0
                    const textOpacity = 1 - textProgress;

                    // translateY: 从中间(-50%)向上移动到 -130%
                    const translateY = -50 - (textProgress * 80); // -50% → -130%

                    proVideoOverlayText.style.opacity = `${textOpacity}`;
                    proVideoOverlayText.style.transform = `translate(-50%, ${translateY}%)`;
                } else {
                    // 文字完全消失在顶部
                    proVideoOverlayText.style.opacity = '0';
                    proVideoOverlayText.style.transform = 'translate(-50%, -130%)';
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (!proVideoTicking) {
                requestAnimationFrame(updateProVideoScroll);
                proVideoTicking = true;
            }
        }, { passive: true });

        // 初始化
        updateProVideoScroll();
    }

    // ---- 专业视频轮播图逻辑 ----
    const proVideoCarouselTrack = document.getElementById('proVideoCarouselTrack');
    const proVideoSlides = document.querySelectorAll('.pro-video-carousel-slide');
    const proVideoPrevBtn = document.getElementById('proVideoCarouselPrev');
    const proVideoNextBtn = document.getElementById('proVideoCarouselNext');

    if (proVideoCarouselTrack && proVideoSlides.length > 0) {
        let currentProVideoIndex = 0;
        const totalProVideoSlides = proVideoSlides.length;

        function updateProVideoCarousel() {
            const isMobile = window.innerWidth <= 768;
            const gap = isMobile ? 12 : 20;
            const slideWidth = proVideoSlides[0].offsetWidth + gap;
            const transformValue = -(currentProVideoIndex * slideWidth) + (proVideoCarouselTrack.parentElement.offsetWidth / 2 - slideWidth / 2);
            proVideoCarouselTrack.style.transform = `translateX(${transformValue}px)`;

            proVideoSlides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentProVideoIndex);
            });
        }

        function goToProVideoSlide(index) {
            currentProVideoIndex = Math.max(0, Math.min(index, totalProVideoSlides - 1));
            updateProVideoCarousel();
        }

        if (proVideoPrevBtn) {
            proVideoPrevBtn.addEventListener('click', () => {
                goToProVideoSlide(currentProVideoIndex - 1);
            });
        }

        if (proVideoNextBtn) {
            proVideoNextBtn.addEventListener('click', () => {
                goToProVideoSlide(currentProVideoIndex + 1);
            });
        }

        updateProVideoCarousel();

        window.addEventListener('resize', () => {
            updateProVideoCarousel();
        });
    }

    // ---- Shot on iPhone 视频弹窗逻辑 ----
    const shotOnIphonePlayBtn = document.getElementById('shotOnIphonePlayBtn');
    const shotOnIphoneVideoModal = document.getElementById('shotOnIphoneVideoModal');
    const shotOnIphoneCloseModalBtn = document.getElementById('shotOnIphoneCloseModalBtn');
    const shotOnIphoneModalBackdrop = document.getElementById('shotOnIphoneModalBackdrop');
    const shotOnIphoneModalVideo = document.getElementById('shotOnIphoneVideo');

    function openShotOnIphoneModal() {
        if (shotOnIphoneVideoModal) {
            shotOnIphoneVideoModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (shotOnIphoneModalVideo) {
                shotOnIphoneModalVideo.play().catch(error => {
                    console.log("Auto-play was prevented:", error);
                });
            }
        }
    }

    function closeShotOnIphoneModal() {
        if (shotOnIphoneVideoModal) {
            shotOnIphoneVideoModal.classList.remove('active');
            document.body.style.overflow = '';

            if (shotOnIphoneModalVideo) {
                shotOnIphoneModalVideo.pause();
                shotOnIphoneModalVideo.currentTime = 0;
            }
        }
    }

    if (shotOnIphonePlayBtn) shotOnIphonePlayBtn.addEventListener('click', openShotOnIphoneModal);
    if (shotOnIphoneCloseModalBtn) shotOnIphoneCloseModalBtn.addEventListener('click', closeShotOnIphoneModal);
    if (shotOnIphoneModalBackdrop) shotOnIphoneModalBackdrop.addEventListener('click', closeShotOnIphoneModal);

    // ---- 升级机型比较自定义下拉框逻辑 ----
    const customSelectWrapper = document.getElementById('customSelectWrapper');
    const selectTrigger = customSelectWrapper.querySelector('.custom-select-trigger');
    const optionsContainer = customSelectWrapper.querySelector('.custom-options-container');
    const customOptions = customSelectWrapper.querySelectorAll('.custom-option');
    const selectedOptionText = document.getElementById('selectedOptionText');

    const cpuStatValue = document.getElementById('cpuStatValue');
    const gpuStatValue = document.getElementById('gpuStatValue');
    const proStatValue = document.getElementById('proStatValue');
    const maxStatValue = document.getElementById('maxStatValue');

    // 切换下拉框显示
    selectTrigger.addEventListener('click', (e) => {
        customSelectWrapper.classList.toggle('open');
        e.stopPropagation();
    });

    // 点击外部关闭下拉框
    document.addEventListener('click', () => {
        customSelectWrapper.classList.remove('open');
    });

    customOptions.forEach(option => {
        option.addEventListener('click', function () {
            const val = this.getAttribute('data-value');
            const text = this.textContent;

            // 更新触发器文字
            selectedOptionText.textContent = text;

            // 更新选中状态
            customOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            // 从 HTML data 属性读取完整内容
            const cpuVal = this.getAttribute('data-cpu-val');
            const gpuVal = this.getAttribute('data-gpu-val');
            const proVal = this.getAttribute('data-pro-val');
            const maxVal = this.getAttribute('data-max-val');

            // 添加动画效果
            const statsItems = document.querySelectorAll('.comp-stat-item');
            statsItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(15px)';
                item.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            setTimeout(() => {
                if (cpuStatValue) cpuStatValue.textContent = cpuVal;
                if (gpuStatValue) gpuStatValue.textContent = gpuVal;
                if (proStatValue) proStatValue.textContent = proVal;
                if (maxStatValue) maxStatValue.textContent = maxVal;

                statsItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 60);
                });
            }, 350);


            customSelectWrapper.classList.remove('open');
        });
    });

    // ---- 必备功能：滚动缩放逻辑 (Essential Features Scroll Effect) ----
    const essentialSection = document.getElementById('essentialFeaturesSection');
    const essentialContainer = document.getElementById('essentialImagesContainer');

    if (essentialSection && essentialContainer) {
        let essentialTicking = false;

        // 使用 IntersectionObserver 触发外观动画
        const essentialObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    essentialSection.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        essentialObserver.observe(essentialSection);

        window.addEventListener('scroll', () => {
            if (!essentialTicking) {
                requestAnimationFrame(() => {
                    const rect = essentialSection.getBoundingClientRect();
                    const windowHeight = window.innerHeight;

                    // 当 section 在视口内时计算缩放
                    if (rect.top < windowHeight && rect.bottom > 0) {
                        // 计算滚动进度: 0 (完全在视口下方) 到 1 (完全在视口上方)
                        const totalRange = windowHeight + rect.height;
                        const scrollProgress = (windowHeight - rect.top) / totalRange;

                        // "逐渐缩小"：从刚进入(scale大) 到 向上滚动消失(scale小)
                        const maxScale = 1.15;
                        const minScale = 1.00559;
                        const range = maxScale - minScale;

                        const currentScale = maxScale - (scrollProgress * range);

                        // 微调位置，增加漂浮感
                        const translateY = (1 - scrollProgress) * 15;

                        essentialContainer.style.transform = `matrix(${currentScale}, 0, 0, currentScale, 0, ${translateY})`;

                        // --- 优化：侧边图片向中间靠近及高度对齐 ---
                        const leftWrapper = essentialContainer.querySelector('.left');
                        const rightWrapper = essentialContainer.querySelector('.right');
                        // const middleWrapper = essentialContainer.querySelector('.middle');

                        // 1. 中间图：移除 scale 效果，按用户要求保持默认对齐高度
                        // 2. 避免遮挡：初始状态设定为向外离远一点 (-25px)，随着滚动逐渐合拢到 0
                        const sideOffset = -25 * (1 - scrollProgress);

                        if (leftWrapper) leftWrapper.style.transform = `translateX(${sideOffset}px) scale(1)`;
                        if (rightWrapper) rightWrapper.style.transform = `translateX(${-sideOffset}px) scale(1)`;
                        // if (middleWrapper) middleWrapper.style.transform = `none`;
                    }
                    essentialTicking = false;
                });
                essentialTicking = true;
            }
        }, { passive: true });
    }

    // ---- iOS 26 奇妙模块轮播逻辑 (iOS 26 Carousel Logic) ----
    const iosCarouselTrack = document.getElementById('iosCarouselTrack');
    const iosSlides = document.querySelectorAll('.ios-carousel-slide');
    const iosPrevBtn = document.getElementById('iosCarouselPrev');
    const iosNextBtn = document.getElementById('iosCarouselNext');

    if (iosCarouselTrack && iosSlides.length > 0) {
        let currentIosIndex = 0;
        const totalIosSlides = iosSlides.length;

        function updateIosCarousel() {
            const isMobile = window.innerWidth <= 768;
            const gap = isMobile ? 20 : 30;
            const slideWidth = iosSlides[0].offsetWidth + gap;

            // 基础位移：左对齐滑动
            const transformValue = -(currentIosIndex * slideWidth);
            iosCarouselTrack.style.transform = `translateX(${transformValue}px)`;

            // 更新按钮状态
            if (iosPrevBtn) iosPrevBtn.disabled = currentIosIndex === 0;
            if (iosNextBtn) {
                // 如果剩余空间不足以显示更多卡片则禁用
                const containerWidth = iosCarouselTrack.parentElement.offsetWidth;
                const visibleCount = Math.floor(containerWidth / slideWidth);
                iosNextBtn.disabled = currentIosIndex >= totalIosSlides - visibleCount;
            }
        }

        if (iosPrevBtn) {
            iosPrevBtn.addEventListener('click', () => {
                currentIosIndex = Math.max(0, currentIosIndex - 1);
                updateIosCarousel();
            });
        }

        if (iosNextBtn) {
            iosNextBtn.addEventListener('click', () => {
                currentIosIndex = Math.min(totalIosSlides - 1, currentIosIndex + 1);
                updateIosCarousel();
            });
        }

        // 初始化
        setTimeout(updateIosCarousel, 100);
        window.addEventListener('resize', updateIosCarousel);
    }

});


