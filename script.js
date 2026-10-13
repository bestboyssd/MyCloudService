const CONFIG = {
    supabaseUrl: "https://dizskzthebdjagikysrk.supabase.co",
    supabasePublishableKey: "sb_publishable_DkTv0gfKCcrVPKmW0-QG6w_YyVjnjXF",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpenNrenRoZWJkamFnaWt5c3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTQ2OTEsImV4cCI6MjEwNzAzMDY5MX0.QXr2MoGI1mJP5oCopOhZYDLqcseMp6YJbT4VN_we44M",
    bucket: "files",
    pageSize: 18,
    listPageSize: 100,
    listPageConcurrency: 3,
    maxQueueCount: 30,
    uploadConcurrency: 3,
    storageQuotaBytes: 50 * 1024 * 1024 * 1024,
    messageMs: 4200
};

const FILE_NAME_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const STORAGE_KEYS = {
    settings: "my-cloud-service-settings",
    theme: "my-cloud-service-theme",
    view: "my-cloud-service-view",
    favorites: "my-cloud-service-favorites"
};

const DEFAULT_SETTINGS = {
    autoLoad: true,
    maxFileSize: 50,
    compression: false,
    reduceMotion: false
};

const $ = (id) => document.getElementById(id);
const elements = {
    body: document.body,
    message: $("message"),
    connectionStatus: $("connectionStatus"),
    brandTitleRow: document.querySelector(".brand-copy__title-row"),
    heroActions: document.querySelector(".hero__actions"),
    uploadNote: document.querySelector(".upload-card .surface-note"),
    themeToggle: $("themeToggle"),
    settingsBtn: $("settingsBtn"),
    refreshBtn: $("refreshBtn"),
    queueMetric: $("queueMetric"),
    libraryMetric: $("libraryMetric"),
    usageMetric: $("usageMetric"),
    uploadArea: $("uploadArea"),
    fileInput: $("fileInput"),
    browseBtn: $("browseBtn"),
    clearQueueBtn: $("clearQueueBtn"),
    uploadSelectedBtn: $("uploadSelectedBtn"),
    uploadHint: $("uploadHint"),
    selectAllBtn: $("selectAllBtn"),
    deselectAllBtn: $("deselectAllBtn"),
    previewList: $("previewList"),
    queueSummary: $("queueSummary"),
    selectionSummary: $("selectionSummary"),
    progressSection: $("progressSection"),
    progressFill: $("progressFill"),
    progressText: $("progressText"),
    progressPercent: $("progressPercent"),
    cancelUploadBtn: $("cancelUploadBtn"),
    speedText: $("speedText"),
    etaText: $("etaText"),
    loadFilesBtn: $("loadFilesBtn"),
    statsBtn: $("statsBtn"),
    exportBtn: $("exportBtn"),
    searchInput: $("searchInput"),
    clearSearchBtn: $("clearSearchBtn"),
    sortSelect: $("sortSelect"),
    filterSelect: $("filterSelect"),
    toggleViewBtn: $("toggleViewBtn"),
    selectVisibleBtn: $("selectVisibleBtn"),
    bulkActions: $("bulkActions"),
    bulkCount: $("bulkCount"),
    shareSelectedBtn: $("shareSelectedBtn"),
    downloadSelectedBtn: $("downloadSelectedBtn"),
    deleteSelectedBtn: $("deleteSelectedBtn"),
    filesCountLabel: $("filesCountLabel"),
    storageUsageLabel: $("storageUsageLabel"),
    mobileNav: $("mobileNav"),
    filesList: $("filesList"),
    favoriteSelectedBtn: $("favoriteSelectedBtn"),
    loadMoreSentinel: $("loadMoreSentinel"),
    settingsModal: $("settingsModal"),
    autoLoad: $("autoLoad"),
    maxFileSize: $("maxFileSize"),
    compression: $("compression"),
    reduceMotion: $("reduceMotion"),
    saveSettingsBtn: $("saveSettingsBtn"),
    fileInfoModal: $("fileInfoModal"),
    fileInfoContent: $("fileInfoContent"),
    statsModal: $("statsModal"),
    statsContent: $("statsContent"),
    viewerModal: $("viewerModal"),
    viewerPanel: $("viewerPanel"),
    viewerStage: $("viewerStage"),
    viewerKindPill: $("viewerKindPill"),
    viewerName: $("viewerName"),
    viewerMeta: $("viewerMeta"),
    viewerNote: $("viewerNote"),
    viewerShareBtn: $("viewerShareBtn"),
    viewerDownloadBtn: $("viewerDownloadBtn"),
    viewerInfoBtn: $("viewerInfoBtn"),
    fileActionModal: $("fileActionModal"),
    actionThumb: $("actionThumb"),
    actionName: $("actionName"),
    actionMeta: $("actionMeta"),
    actionPreviewBtn: $("actionPreviewBtn"),
    actionSelectBtn: $("actionSelectBtn"),
    actionInfoBtn: $("actionInfoBtn"),
    actionRenameBtn: $("actionRenameBtn"),
    actionShareBtn: $("actionShareBtn"),
    actionDownloadBtn: $("actionDownloadBtn"),
    actionDeleteBtn: $("actionDeleteBtn"),
    renameModal: $("renameModal"),
    renameCurrentName: $("renameCurrentName"),
    renameInput: $("renameInput"),
    renameSubmitBtn: $("renameSubmitBtn"),
    themeMeta: document.querySelector('meta[name="theme-color"]')
};

const supabaseClient = window.supabase
    ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey)
    : null;

const state = {
    settings: loadStoredSettings(),
    theme: loadStoredTheme(),
    currentView: localStorage.getItem(STORAGE_KEYS.view) === "list" ? "list" : "grid",
    queue: [],
    files: [],
    filteredFiles: [],
    selectedUploaded: new Set(),
    favoriteFiles: new Set(loadStoredFavorites()),
    visibleCount: CONFIG.pageSize,
    isLibraryLoaded: false,
    isLibraryLoading: false,
    isUploading: false,
    isThemeTransitioning: false,
    mobileViewTransitionToken: 0,
    mobileViewAnimation: null,
    cancelUploadRequested: false,
    activeUploadRequests: new Set(),
    draggedQueueId: null,
    uploadSession: 0,
    progressHideTimer: null,
    searchTimer: null,
    messageTimer: null,
    lastSyncedAt: null,
    modalReturnFocus: null,
    observer: null,
    revealObserver: null,
    renameTarget: null,
    viewerTarget: null,
    viewerObjectUrl: null,
    viewerLoadToken: 0,
    actionTarget: null
};

init();

function init() {
    placeConnectionStatus();
    window.addEventListener("resize", placeConnectionStatus);
    syncSettingsForm();
    applyTheme(state.theme, false);
    applyReducedMotion();
    applyView(state.currentView, false);
    setUploadHint();
    updateSearchControl();
    syncConnectivity();
    renderQueue();
    renderLibrary();
    updateMetrics();
    bindEvents();
    setupRevealObserver();
    setupInfiniteScroll();
    registerServiceWorker();
    if (!supabaseClient) {
        showMessage("Supabase could not initialize. Check the CDN script before using uploads.", "error", 7000);
        return;
    }
    if (state.settings.autoLoad) loadLibrary({ silent: true, trigger: "load" });
}

function placeConnectionStatus() {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const libraryLabel = isMobile ? "Refresh Library" : "Load Library";
    elements.loadFilesBtn.dataset.defaultText = libraryLabel;
    elements.loadFilesBtn.textContent = libraryLabel;
    elements.uploadNote.textContent = isMobile ? "Anonymous uploads" : "Anonymous uploads only";
    const destination = isMobile ? elements.brandTitleRow : elements.heroActions;
    if (!destination || elements.connectionStatus.parentElement === destination) return;
    if (isMobile) {
        destination.append(elements.connectionStatus);
    } else {
        destination.insertBefore(elements.connectionStatus, elements.themeToggle);
    }
}

function bindEvents() {
    elements.mobileNav.addEventListener("click", handleMobileNavigation);
    elements.browseBtn.addEventListener("click", () => !state.isUploading && elements.fileInput.click());
    elements.uploadArea.addEventListener("keydown", (event) => {
        if (state.isUploading || !["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        elements.fileInput.click();
    });
    elements.fileInput.addEventListener("change", (event) => {
        handleFiles(event.target.files);
        event.target.value = "";
    });
    ["dragenter", "dragover"].forEach((name) => elements.uploadArea.addEventListener(name, (event) => {
        event.preventDefault();
        if (!state.isUploading) elements.uploadArea.classList.add("is-dragover");
    }));
    ["dragleave", "drop"].forEach((name) => elements.uploadArea.addEventListener(name, (event) => {
        event.preventDefault();
        elements.uploadArea.classList.remove("is-dragover");
    }));
    elements.uploadArea.addEventListener("drop", (event) => !state.isUploading && handleFiles(event.dataTransfer.files));
    elements.selectAllBtn.addEventListener("click", () => { state.queue.forEach((item) => item.selected = true); renderQueue(); });
    elements.deselectAllBtn.addEventListener("click", () => { state.queue.forEach((item) => item.selected = false); renderQueue(); });
    elements.clearQueueBtn.addEventListener("click", clearQueue);
    elements.uploadSelectedBtn.addEventListener("click", uploadSelectedQueue);
    elements.cancelUploadBtn.addEventListener("click", cancelUploadBatch);
    elements.themeToggle.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark", true));
    elements.settingsBtn.addEventListener("click", () => openModal(elements.settingsModal));
    elements.saveSettingsBtn.addEventListener("click", saveSettings);
    elements.viewerShareBtn.addEventListener("click", () => state.viewerTarget && copyPublicLinks([state.viewerTarget]));
    elements.viewerDownloadBtn.addEventListener("click", () => state.viewerTarget && downloadFile(state.viewerTarget).catch((error) => showMessage(`Download failed: ${error.message}`, "error")));
    elements.viewerInfoBtn.addEventListener("click", () => {
        const fileName = state.viewerTarget;
        if (!fileName) return;
        closeModal(elements.viewerModal);
        showFileInfo(fileName);
    });
    elements.actionPreviewBtn.addEventListener("click", () => {
        const fileName = state.actionTarget;
        if (!fileName) return;
        closeModal(elements.fileActionModal);
        openMediaViewer(fileName);
    });
    elements.actionSelectBtn.addEventListener("click", () => {
        const fileName = state.actionTarget;
        if (!fileName) return;
        const willSelect = !state.selectedUploaded.has(fileName);
        if (willSelect) state.selectedUploaded.add(fileName);
        else state.selectedUploaded.delete(fileName);
        renderLibrary();
        openFileActions(fileName);
        showMessage(willSelect ? "Added to selection." : "Removed from selection.", "success", 1600);
    });
    elements.actionInfoBtn.addEventListener("click", () => {
        const fileName = state.actionTarget;
        if (!fileName) return;
        closeModal(elements.fileActionModal);
        if (!elements.viewerModal.hidden) closeModal(elements.viewerModal);
        showFileInfo(fileName);
    });
    elements.actionRenameBtn.addEventListener("click", () => {
        const fileName = state.actionTarget;
        if (!fileName) return;
        closeModal(elements.fileActionModal);
        openRenameModal(fileName);
    });
    elements.actionShareBtn.addEventListener("click", () => state.actionTarget && copyPublicLinks([state.actionTarget]));
    elements.actionDownloadBtn.addEventListener("click", () => state.actionTarget && downloadFile(state.actionTarget).catch((error) => showMessage(`Download failed: ${error.message}`, "error")));
    elements.actionDeleteBtn.addEventListener("click", async () => {
        const fileName = state.actionTarget;
        if (!fileName) return;
        if (!window.confirm(`Delete ${getDisplayName(fileName)}?`)) return;
        closeModal(elements.fileActionModal);
        await deleteFiles([fileName]);
    });
    elements.renameSubmitBtn.addEventListener("click", submitRename);
    elements.renameInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        submitRename();
    });
    elements.loadFilesBtn.addEventListener("click", () => loadLibrary({ trigger: "load" }));
    elements.refreshBtn.addEventListener("click", () => loadLibrary({ silent: true, trigger: "refresh" }));
    elements.statsBtn.addEventListener("click", showStats);
    elements.exportBtn.addEventListener("click", exportLibrary);
    elements.searchInput.addEventListener("input", () => {
        updateSearchControl();
        scheduleLibrarySearch();
    });
    elements.clearSearchBtn.addEventListener("click", clearLibrarySearch);
    elements.sortSelect.addEventListener("change", () => {
        window.clearTimeout(state.searchTimer);
        applyFilters(true);
    });
    elements.filterSelect.addEventListener("change", () => {
        window.clearTimeout(state.searchTimer);
        applyFilters(true);
    });
    elements.toggleViewBtn.addEventListener("click", () => applyView(state.currentView === "grid" ? "list" : "grid", true));
    elements.selectVisibleBtn.addEventListener("click", toggleVisibleSelection);
    elements.favoriteSelectedBtn.addEventListener("click", toggleSelectedFavorites);
    elements.shareSelectedBtn.addEventListener("click", () => copyPublicLinks(Array.from(state.selectedUploaded)));
    elements.downloadSelectedBtn.addEventListener("click", downloadSelectedFiles);
    elements.deleteSelectedBtn.addEventListener("click", async () => {
        const names = Array.from(state.selectedUploaded);
        if (names.length && window.confirm(`Delete ${names.length} selected file(s)?`)) await deleteFiles(names);
    });
    elements.previewList.addEventListener("click", handlePreviewClick);
    elements.previewList.addEventListener("change", handlePreviewChange);
    elements.previewList.addEventListener("dragstart", handlePreviewDragStart);
    elements.previewList.addEventListener("dragover", handlePreviewDragOver);
    elements.previewList.addEventListener("dragleave", handlePreviewDragLeave);
    elements.previewList.addEventListener("drop", handlePreviewDrop);
    elements.previewList.addEventListener("dragend", handlePreviewDragEnd);
    elements.filesList.addEventListener("click", handleFilesListClick);
    elements.filesList.addEventListener("change", handleFilesListChange);
    elements.filesList.addEventListener("contextmenu", handleFilesListContextMenu);
    document.querySelectorAll("[data-close-modal]").forEach((node) => node.addEventListener("click", closeAllModals));
    document.addEventListener("keydown", handleKeyboardShortcuts);
    window.addEventListener("online", () => {
        syncConnectivity();
        renderQueue();
    });
    window.addEventListener("offline", () => {
        syncConnectivity();
        renderQueue();
    });
    window.addEventListener("beforeunload", revokeAllPreviewUrls);
}

async function handleMobileNavigation(event) {
    const button = event.target.closest("button[data-mobile-view]");
    if (!button || !elements.mobileNav.contains(button)) return;
    const currentView = elements.body.dataset.mobileView;
    const view = button.dataset.mobileView === "files" ? "files" : "upload";
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const shouldAnimate = view !== currentView
        && isMobile
        && !elements.body.classList.contains("reduce-motion")
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionToken = ++state.mobileViewTransitionToken;
    const outgoingOffset = view === "files" ? -14 : 14;
    const incomingOffset = -outgoingOffset;
    let outgoingAnimation = null;
    state.mobileViewAnimation?.cancel();
    state.mobileViewAnimation = null;

    const updateView = () => {
        elements.body.dataset.mobileView = view;
        elements.mobileNav.querySelectorAll("[data-mobile-view]").forEach((tab) => {
            const active = tab === button;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-pressed", String(active));
        });
    };

    if (view !== currentView && shouldAnimate) {
        const outgoingSection = $(currentView === "files" ? "librarySection" : "uploadPanel");
        outgoingAnimation = outgoingSection.animate(
            [
                { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
                { opacity: 0.4, transform: "translate3d(" + outgoingOffset + "px, 0, 0) scale(0.99)" }
            ],
            { duration: 155, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }
        );
        state.mobileViewAnimation = outgoingAnimation;
        try {
            await outgoingAnimation.finished;
        } catch (error) {
            if (error.name === "AbortError") return;
            throw error;
        }
        if (transitionToken !== state.mobileViewTransitionToken) return;
    }

    updateView();
    outgoingAnimation?.cancel();
    if (state.mobileViewAnimation === outgoingAnimation) state.mobileViewAnimation = null;
    if (view !== currentView && isMobile) {
        const section = $(view === "files" ? "librarySection" : "uploadPanel");
        window.scrollTo({
            top: section.getBoundingClientRect().top + window.scrollY,
            behavior: "instant"
        });
    }

    if (view !== currentView && shouldAnimate) {
        const incomingSection = $(view === "files" ? "librarySection" : "uploadPanel");
        const incomingAnimation = incomingSection.animate(
            [
                { opacity: 0.4, transform: "translate3d(" + incomingOffset + "px, 0, 0) scale(0.99)" },
                { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
            ],
            { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
        state.mobileViewAnimation = incomingAnimation;
        try {
            await incomingAnimation.finished;
        } catch (error) {
            if (error.name !== "AbortError") throw error;
        } finally {
            if (transitionToken === state.mobileViewTransitionToken) state.mobileViewAnimation = null;
        }
    }

    if (view === "files" && !state.isLibraryLoaded && !state.isLibraryLoading) {
        loadLibrary({ silent: true, trigger: "load" });
    }
}
function loadStoredSettings() {
    try {
        return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "null") || {}) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function loadStoredTheme() {
    try {
        return localStorage.getItem(STORAGE_KEYS.theme) === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

function loadStoredFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
        return Array.isArray(favorites) ? favorites.filter((name) => typeof name === "string") : [];
    } catch {
        return [];
    }
}

function saveStoredFavorites() {
    try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(Array.from(state.favoriteFiles)));
    } catch (error) {
        console.warn("Favorites could not be saved:", error);
    }
}

function scheduleLibrarySearch() {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => applyFilters(true), 140);
}

function clearLibrarySearch() {
    elements.searchInput.value = "";
    updateSearchControl();
    applyFilters(true);
    elements.searchInput.focus();
}

function updateSearchControl() {
    const hasQuery = Boolean(elements.searchInput.value.trim());
    elements.clearSearchBtn.hidden = !hasQuery;
    elements.clearSearchBtn.setAttribute("aria-hidden", String(!hasQuery));
}

function syncConnectivity() {
    const online = navigator.onLine !== false;
    const status = !supabaseClient
        ? { label: "Supabase unavailable", tone: "is-error" }
        : online
            ? state.isLibraryLoading
                ? { label: "Syncing", tone: "is-neutral" }
                : { label: state.lastSyncedAt ? "Connected" : "Ready to connect", tone: state.lastSyncedAt ? "is-success" : "is-neutral" }
            : { label: "Offline", tone: "is-warning" };

    elements.connectionStatus.textContent = status.label;
    elements.connectionStatus.className = `status-chip ${status.tone}`;
    elements.connectionStatus.setAttribute("aria-label", `Connection status: ${status.label}`);
    elements.connectionStatus.title = state.lastSyncedAt
        ? `Last synced ${formatDate(state.lastSyncedAt)}`
        : "No successful library sync yet";
    elements.loadFilesBtn.disabled = !supabaseClient || !online || state.isLibraryLoading;
    elements.refreshBtn.disabled = !supabaseClient || !online || state.isLibraryLoading;
    elements.filesList.setAttribute("aria-busy", String(state.isLibraryLoading));
}

function syncSettingsForm() {
    elements.autoLoad.checked = state.settings.autoLoad;
    elements.maxFileSize.value = state.settings.maxFileSize;
    elements.compression.checked = state.settings.compression;
    elements.reduceMotion.checked = state.settings.reduceMotion;
}

function saveSettings() {
    state.settings = {
        autoLoad: elements.autoLoad.checked,
        maxFileSize: Math.max(1, Math.min(2048, Number(elements.maxFileSize.value) || DEFAULT_SETTINGS.maxFileSize)),
        compression: elements.compression.checked,
        reduceMotion: elements.reduceMotion.checked
    };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
    applyReducedMotion();
    setUploadHint();
    renderQueue();
    closeAllModals();
    showMessage("Settings saved.", "success");
}

function applyTheme(theme, persist = true) {
    const nextTheme = theme === "light" ? "light" : "dark";
    if (state.isThemeTransitioning) return;
    const reducedMotion = state.settings.reduceMotion
        || (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!persist || reducedMotion || typeof Element === "undefined" || typeof Element.prototype.animate !== "function") {
        setTheme(nextTheme, persist);
        return;
    }
    if (nextTheme === state.theme) {
        setTheme(nextTheme, persist);
        return;
    }
    runThemeTransition(nextTheme, persist);
}

function setTheme(theme, persist) {
    state.theme = theme;
    elements.body.dataset.theme = state.theme;
    elements.themeToggle.textContent = state.theme === "dark" ? "Light Mode" : "Dark Mode";
    elements.themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
    elements.themeToggle.setAttribute("aria-label", `Switch to ${state.theme === "dark" ? "light" : "dark"} mode`);
    if (elements.themeMeta) elements.themeMeta.setAttribute("content", state.theme === "dark" ? "#141a16" : "#f4f6f3");
    if (persist) {
        try {
            localStorage.setItem(STORAGE_KEYS.theme, state.theme);
        } catch (error) {
            console.warn("Theme preference could not be saved:", error);
        }
    }
}

async function runThemeTransition(theme, persist) {
    state.isThemeTransitioning = true;
    elements.themeToggle.disabled = true;
    let surface = null;

    try {
        if (typeof document.startViewTransition === "function") {
            const transition = document.startViewTransition(() => setTheme(theme, persist));
            await transition.finished;
        } else {
            surface = document.createElement("div");
            surface.className = "theme-transition-surface";
            surface.setAttribute("aria-hidden", "true");
            surface.style.backgroundColor = theme === "dark" ? "#141a16" : "#f4f6f3";
            document.body.append(surface);
            await surface.animate(
                [{ opacity: 0 }, { opacity: 1 }],
                { duration: 180, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" }
            ).finished;
            setTheme(theme, persist);
            await surface.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: 220, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" }
            ).finished;
        }
    } catch (error) {
        setTheme(theme, persist);
    } finally {
        surface?.remove();
        state.isThemeTransitioning = false;
        elements.themeToggle.disabled = false;
    }
}

function applyReducedMotion() {
    elements.body.classList.toggle("reduce-motion", Boolean(state.settings.reduceMotion));
    if (state.settings.reduceMotion) {
        disconnectRevealObserver();
        document.querySelectorAll(".reveal-on-scroll").forEach((node) => node.classList.add("is-visible"));
        return;
    }
    if (!state.revealObserver) setupRevealObserver();
    observeRevealTargets();
}

function applyView(view, persist = true) {
    state.currentView = view === "list" ? "list" : "grid";
    elements.filesList.classList.remove("grid-view", "list-view");
    elements.filesList.classList.add(`${state.currentView}-view`);
    elements.toggleViewBtn.textContent = state.currentView === "grid" ? "Compact view" : "Grid view";
    if (persist) localStorage.setItem(STORAGE_KEYS.view, state.currentView);
}

function setUploadHint() {
    if (!elements.uploadHint) return;
    elements.uploadHint.textContent = `Images and videos up to ${state.settings.maxFileSize} MB each · ${CONFIG.maxQueueCount} files per batch.`;
    elements.uploadHint.hidden = false;
    elements.uploadHint.setAttribute("aria-hidden", "false");
}

function handleFiles(fileList) {
    if (state.isUploading) return showMessage("Wait for the current upload batch to finish first.", "info");
    const files = Array.from(fileList || []);
    if (!files.length) return;
    let accepted = 0;
    let typeRejected = 0;
    let sizeRejected = 0;
    let queueRejected = 0;
    const maxBytes = state.settings.maxFileSize * 1024 * 1024;
    for (const file of files) {
        if (state.queue.length + accepted >= CONFIG.maxQueueCount) {
            queueRejected += 1;
            continue;
        }
        if (!isSupportedFile(file)) {
            typeRejected += 1;
            continue;
        }
        if (file.size > maxBytes) {
            sizeRejected += 1;
            continue;
        }
        state.queue.push({
            id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            selected: true,
            previewUrl: URL.createObjectURL(file)
        });
        accepted += 1;
    }
    renderQueue();
    if (!accepted) return showMessage("No files were added. Check type, size, or queue limit.", "error");
    const parts = [`Added ${accepted} file(s) to the queue.`];
    if (typeRejected) parts.push(`${typeRejected} unsupported.`);
    if (sizeRejected) parts.push(`${sizeRejected} over the size limit.`);
    if (queueRejected) parts.push(`Queue cap is ${CONFIG.maxQueueCount}.`);
    showMessage(parts.join(" "), "success");
}

function renderQueue() {
    const selectedCount = state.queue.filter((item) => item.selected).length;
    const hasQueuedFiles = state.queue.length > 0;
    elements.queueMetric.textContent = state.queue.length + " file" + (state.queue.length === 1 ? "" : "s");
    elements.queueSummary.closest(".queue-summary").classList.toggle("is-empty", !hasQueuedFiles);
    elements.queueSummary.textContent = hasQueuedFiles
        ? state.queue.length + " file" + (state.queue.length === 1 ? "" : "s") + " staged for upload."
        : "";
    elements.selectionSummary.textContent = selectedCount + " selected";
    elements.clearQueueBtn.disabled = state.isUploading || !state.queue.length;
    elements.selectAllBtn.disabled = state.isUploading || !state.queue.length;
    elements.deselectAllBtn.disabled = state.isUploading || !state.queue.length;
    elements.uploadSelectedBtn.disabled = state.isUploading || !selectedCount || !supabaseClient || navigator.onLine === false;
    elements.uploadSelectedBtn.textContent = selectedCount ? `Upload Selected (${selectedCount})` : "Upload Selected";
    if (!state.queue.length) {
        elements.previewList.innerHTML = getEmptyStateMarkup(
            "queue",
            "No staged files",
            "Drop images or videos into the upload zone to preview, select, and reorder them before uploading."
        );
        return updateMetrics();
    }
    elements.previewList.innerHTML = state.queue.map((item, index) => {
        const kind = getFileKind(item.file);
        const fileName = escapeHtml(item.file.name);
        const media = kind === "image"
            ? `<img src="${item.previewUrl}" alt="${fileName}">`
            : `<video src="${item.previewUrl}" muted playsinline preload="metadata"></video>`;
        return `
            <article class="preview-card reveal-on-scroll" data-id="${item.id}" draggable="true">
                <div class="preview-card__top">
                    <label class="checkbox-pill">
                        <input type="checkbox" data-action="toggle-queue" data-id="${item.id}" ${item.selected ? "checked" : ""}>
                        <span>Include</span>
                    </label>
                    <div class="preview-card__actions">
                        <div class="preview-card__reorder">
                            <button class="icon-button compact preview-card__move" type="button" data-action="move-queue-up" data-id="${item.id}" aria-label="Move ${fileName} up in queue" title="Move up" ${index === 0 ? "disabled" : ""}>&uarr;</button>
                            <button class="icon-button compact preview-card__move" type="button" data-action="move-queue-down" data-id="${item.id}" aria-label="Move ${fileName} down in queue" title="Move down" ${index === state.queue.length - 1 ? "disabled" : ""}>&darr;</button>
                        </div>
                        <button class="icon-button compact" type="button" data-action="remove-queue" data-id="${item.id}">Remove</button>
                    </div>
                </div>
                <div class="preview-card__media">${media}</div>
                <div class="preview-card__meta">
                    <h3 title="${fileName}">${fileName}</h3>
                    <p>${formatBytes(item.file.size)}${state.settings.compression && canCompress(item.file) ? " - compression ready" : ""}</p>
                </div>
                <div class="preview-card__footer">
                    <span class="file-pill">${kind === "image" ? "Image" : "Video"}</span>
                    <span class="drag-hint">Drag to reorder</span>
                </div>
            </article>
        `;
    }).join("");
    observeRevealTargets(elements.previewList);
    updateMetrics();
}

function handlePreviewClick(event) {
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "remove-queue") removeQueueItem(action.dataset.id);
    if (action.dataset.action === "move-queue-up") moveQueueItem(action.dataset.id, -1);
    if (action.dataset.action === "move-queue-down") moveQueueItem(action.dataset.id, 1);
}

function moveQueueItem(id, direction) {
    const fromIndex = state.queue.findIndex((item) => item.id === id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= state.queue.length) return;

    const [item] = state.queue.splice(fromIndex, 1);
    state.queue.splice(toIndex, 0, item);
    renderQueue();

    const controls = Array.from(elements.previewList.querySelectorAll(".preview-card__move"));
    const preferredAction = direction < 0 ? "move-queue-up" : "move-queue-down";
    const focusTarget = controls.find((control) => control.dataset.id === id && control.dataset.action === preferredAction && !control.disabled)
        || controls.find((control) => control.dataset.id === id && !control.disabled);
    focusTarget?.focus();
    showMessage(`Moved ${getDisplayName(item.file.name)} to position ${toIndex + 1}.`, "success", 1600);
}

function handlePreviewChange(event) {
    const toggle = event.target.closest('input[data-action="toggle-queue"]');
    if (!toggle) return;
    const item = state.queue.find((entry) => entry.id === toggle.dataset.id);
    if (!item) return;
    item.selected = toggle.checked;
    renderQueue();
}

function handlePreviewDragStart(event) {
    const card = event.target.closest(".preview-card");
    if (!card) return;
    state.draggedQueueId = card.dataset.id;
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
}

function handlePreviewDragOver(event) {
    const card = event.target.closest(".preview-card");
    if (!card || !state.draggedQueueId) return;
    event.preventDefault();
    card.classList.add("is-drop-target");
}

function handlePreviewDragLeave(event) {
    const card = event.target.closest(".preview-card");
    if (card) card.classList.remove("is-drop-target");
}

function handlePreviewDrop(event) {
    const card = event.target.closest(".preview-card");
    if (!card || !state.draggedQueueId) return;
    event.preventDefault();
    const fromIndex = state.queue.findIndex((item) => item.id === state.draggedQueueId);
    const toIndex = state.queue.findIndex((item) => item.id === card.dataset.id);
    elements.previewList.querySelectorAll(".preview-card").forEach((node) => node.classList.remove("is-drop-target"));
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const [moved] = state.queue.splice(fromIndex, 1);
    state.queue.splice(toIndex, 0, moved);
    renderQueue();
}

function handlePreviewDragEnd() {
    state.draggedQueueId = null;
    elements.previewList.querySelectorAll(".preview-card").forEach((node) => node.classList.remove("is-dragging", "is-drop-target"));
}

function removeQueueItem(id) {
    const index = state.queue.findIndex((item) => item.id === id);
    if (index === -1) return;
    URL.revokeObjectURL(state.queue[index].previewUrl);
    state.queue.splice(index, 1);
    renderQueue();
}

function clearQueue() {
    revokeAllPreviewUrls();
    state.queue = [];
    renderQueue();
}

function revokeAllPreviewUrls() {
    state.queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}

async function uploadSelectedQueue() {
    if (!supabaseClient) return showMessage("Supabase is not available. Uploads cannot start.", "error");
    if (navigator.onLine === false) return showMessage("You are offline. Reconnect before uploading files.", "info");
    const selected = state.queue.filter((item) => item.selected);
    if (!selected.length) return showMessage("Select at least one file to upload.", "info");
    const uploadSession = ++state.uploadSession;
    window.clearTimeout(state.progressHideTimer);
    state.isUploading = true;
    state.cancelUploadRequested = false;
    elements.browseBtn.disabled = true;
    elements.fileInput.disabled = true;
    elements.progressSection.hidden = false;
    elements.progressSection.setAttribute("aria-busy", "true");
    elements.progressSection.classList.add("is-visible");
    elements.cancelUploadBtn.hidden = false;
    elements.cancelUploadBtn.disabled = false;
    elements.cancelUploadBtn.textContent = "Cancel uploads";
    elements.progressFill.style.width = "0%";
    elements.progressPercent.textContent = "0%";
    elements.progressSection.querySelector('[role="progressbar"]')?.setAttribute("aria-valuenow", "0");
    elements.speedText.textContent = "Speed: --";
    elements.etaText.textContent = "ETA: --";
    renderQueue();
    try {
        const jobs = new Array(selected.length);
        let savings = 0;
        let nextPreparation = 0;
        const uploadConcurrency = getUploadConcurrency();
        const preparationConcurrency = Math.min(state.settings.compression ? 2 : uploadConcurrency, selected.length);
        await Promise.all(Array.from({ length: preparationConcurrency }, async () => {
            while (nextPreparation < selected.length) {
                const index = nextPreparation++;
                elements.progressText.textContent = `Preparing ${index + 1} of ${selected.length}`;
                const job = await prepareUploadJob(selected[index]);
                jobs[index] = job;
                savings += job.savingsBytes;
            }
        }));
        if (state.cancelUploadRequested) {
            elements.progressText.textContent = "Cancelled before upload started. Files remain in the queue.";
            showMessage("Upload cancelled. Selected files remain in the queue.", "info");
            scheduleProgressHide(1800, uploadSession);
            return;
        }
        const progress = {
            totalBytes: jobs.reduce((sum, job) => sum + job.file.size, 0),
            completedBytes: 0,
            processedFiles: 0,
            successfulFiles: 0,
            failedFiles: 0,
            activeUploads: new Map(),
            startedAt: performance.now(),
            sampleAt: performance.now(),
            sampleBytes: 0,
            speedBytesPerSecond: 0
        };
        const successfulIds = [];
        const failures = [];
        let nextUpload = 0;
        const uploadWorker = async () => {
            while (nextUpload < jobs.length && !state.cancelUploadRequested) {
                const index = nextUpload++;
                const job = jobs[index];
                progress.activeUploads.set(job.item.id, {
                    name: getDisplayName(job.item.file.name),
                    loaded: 0
                });
                updateProgress(progress, jobs.length);
                try {
                    await uploadFileWithProgress(job, (loaded) => {
                        const active = progress.activeUploads.get(job.item.id);
                        if (active) active.loaded = loaded;
                        updateProgress(progress, jobs.length);
                    });
                    successfulIds.push(job.item.id);
                    progress.successfulFiles += 1;
                    progress.completedBytes += job.file.size;
                    progress.processedFiles += 1;
                } catch (error) {
                    if (!state.cancelUploadRequested) {
                        failures.push(`${getDisplayName(job.item.file.name)}: ${error.message}`);
                        progress.failedFiles += 1;
                        progress.processedFiles += 1;
                    }
                } finally {
                    progress.activeUploads.delete(job.item.id);
                    updateProgress(progress, jobs.length);
                }
            }
        };
        const workerCount = Math.min(uploadConcurrency, jobs.length);
        await Promise.all(Array.from({ length: workerCount }, uploadWorker));
        if (successfulIds.length) removeQueueItems(successfulIds);
        if (successfulIds.length && state.settings.autoLoad) await loadLibrary({ silent: true, trigger: "refresh" });
        if (state.cancelUploadRequested) {
            elements.progressText.textContent = `Cancelled. ${successfulIds.length} uploaded; unfinished files remain in the queue.`;
            showMessage(`Upload cancelled. ${successfulIds.length} file(s) finished; unfinished files remain queued.`, "info", 6500);
            scheduleProgressHide(2400, uploadSession);
            return;
        }
        const summary = [`Uploaded ${successfulIds.length} of ${jobs.length} file(s).`];
        if (savings > 0) summary.push(`Saved ${formatBytes(savings)} with compression.`);
        if (failures.length) {
            summary.push(`${failures.length} file(s) failed.`);
            console.error("Upload failures:", failures.join(" | "));
            showMessage(summary.join(" "), "info", 6500);
        } else {
            showMessage(summary.join(" "), "success");
        }
        elements.progressText.textContent = failures.length
            ? `Finished with ${failures.length} failure(s). Failed files remain in the queue.`
            : "Upload complete";
        if (!failures.length) scheduleProgressHide(1600, uploadSession);
    } catch (error) {
        console.error(error);
        showMessage(`Upload failed: ${error.message}`, "error", 6500);
    } finally {
        state.isUploading = false;
        state.cancelUploadRequested = false;
        state.activeUploadRequests.clear();
        elements.progressSection.setAttribute("aria-busy", "false");
        elements.cancelUploadBtn.hidden = true;
        elements.cancelUploadBtn.disabled = false;
        elements.cancelUploadBtn.textContent = "Cancel uploads";
        elements.browseBtn.disabled = false;
        elements.fileInput.disabled = false;
        renderQueue();
        syncConnectivity();
    }
}

function cancelUploadBatch() {
    if (!state.isUploading || state.cancelUploadRequested) return;
    state.cancelUploadRequested = true;
    elements.cancelUploadBtn.disabled = true;
    elements.cancelUploadBtn.textContent = "Stopping...";
    elements.progressText.textContent = "Stopping active uploads...";
    Array.from(state.activeUploadRequests).forEach((request) => request.abort());
}

function scheduleProgressHide(delay, uploadSession) {
    window.clearTimeout(state.progressHideTimer);
    state.progressHideTimer = window.setTimeout(() => {
        if (!state.isUploading && state.uploadSession === uploadSession) {
            elements.progressSection.hidden = true;
        }
    }, delay);
}

async function prepareUploadJob(item) {
    let uploadFile = item.file;
    let savingsBytes = 0;
    if (state.settings.compression && canCompress(item.file)) {
        const compressed = await compressImageFile(item.file);
        if (compressed.size < item.file.size) {
            uploadFile = compressed;
            savingsBytes = item.file.size - compressed.size;
        }
    }
    return { item, file: uploadFile, path: buildStoragePath(uploadFile.name), savingsBytes };
}

function getUploadConcurrency() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType)) return 1;
    const isMobile = typeof window.matchMedia === "function" && window.matchMedia("(max-width: 760px)").matches;
    return isMobile ? 2 : CONFIG.uploadConcurrency;
}

function updateProgress(progress, totalFiles) {
    const activeBytes = Array.from(progress.activeUploads.values()).reduce((sum, upload) => sum + upload.loaded, 0);
    const transferred = Math.min(progress.completedBytes + activeBytes, progress.totalBytes);
    const percent = progress.totalBytes ? Math.min((transferred / progress.totalBytes) * 100, 100) : 100;
    const now = performance.now();
    const sampleSeconds = (now - progress.sampleAt) / 1000;
    if (sampleSeconds >= 0.35) {
        const sampleSpeed = Math.max(0, transferred - progress.sampleBytes) / sampleSeconds;
        progress.speedBytesPerSecond = progress.speedBytesPerSecond
            ? progress.speedBytesPerSecond * 0.65 + sampleSpeed * 0.35
            : sampleSpeed;
        progress.sampleAt = now;
        progress.sampleBytes = transferred;
    }
    const elapsed = Math.max((now - progress.startedAt) / 1000, 0.25);
    const speed = progress.speedBytesPerSecond || transferred / elapsed;
    const remaining = Math.max(progress.totalBytes - transferred, 0);
    const eta = speed > 0 ? remaining / speed : Infinity;
    const complete = progress.processedFiles >= totalFiles && progress.failedFiles === 0;
    elements.progressFill.style.width = `${complete ? 100 : percent.toFixed(2)}%`;
    elements.progressPercent.textContent = `${Math.round(complete ? 100 : percent)}%`;
    elements.progressSection.querySelector('[role="progressbar"]')?.setAttribute("aria-valuenow", String(Math.round(complete ? 100 : percent)));
    elements.progressText.textContent = state.cancelUploadRequested
        ? "Stopping active uploads..."
        : complete
            ? `Uploaded ${progress.successfulFiles} of ${totalFiles} files`
            : `Uploaded ${progress.successfulFiles} of ${totalFiles} · ${progress.activeUploads.size} active`;
    elements.speedText.textContent = `Speed: ${speed > 0 ? `${formatBytes(speed)}/s` : "--"}`;
    elements.etaText.textContent = `ETA: ${Number.isFinite(eta) ? formatDuration(eta) : "--"}`;
}

async function loadLibrary({ silent = false, trigger = "load" } = {}) {
    if (!supabaseClient) return showMessage("Supabase is not available. The library cannot be loaded.", "error");
    if (navigator.onLine === false) return showMessage("You are offline. Reconnect to load the library.", "info");
    if (state.isLibraryLoading) return;
    state.isLibraryLoading = true;
    syncConnectivity();
    if (!state.isLibraryLoaded) renderLibraryLoading();
    setButtonLoading(elements.loadFilesBtn, trigger === "load", "Loading...");
    setButtonLoading(elements.refreshBtn, trigger === "refresh", "Refreshing...");
    elements.loadFilesBtn.disabled = true;
    elements.refreshBtn.disabled = true;
    try {
        const collected = [];
        const listPage = async (offset) => {
            const { data, error } = await supabaseClient.storage.from(CONFIG.bucket).list("", {
                limit: CONFIG.listPageSize,
                offset,
                sortBy: { column: "name", order: "asc" }
            });
            if (error) throw error;
            return (data || []).filter((item) => item?.name && !item.name.endsWith("/"));
        };
        let firstPage = await listPage(0);
        collected.push(...firstPage);
        let offset = CONFIG.listPageSize;
        while (firstPage.length === CONFIG.listPageSize) {
            const offsets = Array.from(
                { length: CONFIG.listPageConcurrency },
                (_, index) => offset + index * CONFIG.listPageSize
            );
            const pages = await Promise.all(offsets.map(listPage));
            let reachedEnd = false;
            for (const page of pages) {
                collected.push(...page);
                if (page.length < CONFIG.listPageSize) {
                    reachedEnd = true;
                    break;
                }
            }
            if (reachedEnd) break;
            offset += CONFIG.listPageSize * CONFIG.listPageConcurrency;
            firstPage = pages[pages.length - 1];
        }
        state.files = Array.from(new Map(collected.map((file) => [file.name, file])).values());
        const availableNames = new Set(state.files.map((file) => file.name));
        state.favoriteFiles = new Set(Array.from(state.favoriteFiles).filter((name) => availableNames.has(name)));
        saveStoredFavorites();
        state.filteredFiles = state.files.slice();
        state.isLibraryLoaded = true;
        state.lastSyncedAt = new Date();
        state.visibleCount = CONFIG.pageSize;
        state.selectedUploaded = new Set(Array.from(state.selectedUploaded).filter((name) => availableNames.has(name)));
        applyFilters(true);
        if (!silent) showMessage(`Loaded ${state.files.length} file(s).`, "success");
    } catch (error) {
        console.error(error);
        if (!state.isLibraryLoaded) {
            elements.filesList.innerHTML = getEmptyStateMarkup(
                "error",
                "Couldn’t load the library",
                "Check your connection and Supabase policies, then try again."
            );
            elements.filesCountLabel.textContent = "Library unavailable";
            elements.storageUsageLabel.textContent = "Usage: unavailable";
            elements.loadMoreSentinel.hidden = true;
            updateSelectionToolbar();
        }
        showMessage(`Failed to load files: ${error.message}`, "error", 6500);
    } finally {
        state.isLibraryLoading = false;
        setButtonLoading(elements.loadFilesBtn, false);
        setButtonLoading(elements.refreshBtn, false);
        syncConnectivity();
    }
}

function renderLibraryLoading() {
    elements.filesList.innerHTML = `
        <div class="empty-state empty-state--loading" role="status">
            <div class="empty-state__icon" aria-hidden="true"><span class="loading-spinner"></span></div>
            <strong>Loading your library&hellip;</strong>
            <p>Fetching the latest files from Supabase Storage.</p>
        </div>
    `;
    elements.filesCountLabel.textContent = "Loading library&hellip;";
    elements.storageUsageLabel.textContent = "Usage: calculating&hellip;";
    elements.loadMoreSentinel.hidden = true;
    updateSelectionToolbar();
}

function applyFilters(resetVisible = false) {
    if (!state.isLibraryLoaded) return renderLibrary();
    const query = elements.searchInput.value.trim().toLowerCase();
    const filter = elements.filterSelect.value;
    const sortKey = elements.sortSelect.value;
    state.filteredFiles = state.files
        .filter((file) => matchesFileFilter(file, query, filter))
        .map((file) => ({
            file,
            sortValue: sortKey === "name"
                ? getDisplayName(file.name)
                : sortKey === "size"
                    ? getFileSize(file)
                    : Date.parse(file.created_at || file.updated_at || "") || 0
        }))
        .sort((a, b) => sortKey === "name"
            ? FILE_NAME_COLLATOR.compare(a.sortValue, b.sortValue)
            : b.sortValue - a.sortValue)
        .map(({ file }) => file);
    if (resetVisible) state.visibleCount = CONFIG.pageSize;
    renderLibrary();
}

function renderLibrary() {
    if (!state.isLibraryLoaded) {
        elements.filesList.innerHTML = getEmptyStateMarkup(
            "library",
            "Library not loaded",
            "Use the Load Library button to fetch files from Supabase storage."
        );
        elements.filesCountLabel.textContent = "Library not loaded";
        elements.storageUsageLabel.textContent = "Usage: 0 B";
        elements.loadMoreSentinel.hidden = true;
        updateSelectionToolbar();
        return updateMetrics();
    }
    if (!state.filteredFiles.length) {
        const isFavoriteFilter = elements.filterSelect.value === "favorite";
        elements.filesList.innerHTML = getEmptyStateMarkup(
            "search",
            isFavoriteFilter ? "No favorites yet" : "No matching files",
            isFavoriteFilter ? "Mark files with the star to keep them close at hand." : "Try another search or filter, or upload new media to populate the library."
        );
        elements.filesCountLabel.textContent = "Showing 0 files";
        elements.storageUsageLabel.textContent = `Usage: ${formatBytes(getTotalLibrarySize())} / ${formatBytes(CONFIG.storageQuotaBytes)}`;
        elements.loadMoreSentinel.hidden = true;
        updateSelectionToolbar();
        return updateMetrics();
    }
    const visible = state.filteredFiles.slice(0, state.visibleCount);
    elements.filesList.innerHTML = visible.map((file, index) => buildFileCardMarkup(file, index)).join("");
    elements.filesCountLabel.textContent = `Showing ${visible.length} of ${state.filteredFiles.length} file(s)`;
    elements.storageUsageLabel.textContent = `Usage: ${formatBytes(getTotalLibrarySize())} / ${formatBytes(CONFIG.storageQuotaBytes)}`;
    elements.loadMoreSentinel.hidden = visible.length >= state.filteredFiles.length;
    if (!elements.loadMoreSentinel.hidden) elements.loadMoreSentinel.textContent = `Scroll to load ${state.filteredFiles.length - visible.length} more file(s)`;
    observeRevealTargets(elements.filesList);
    updateSelectionToolbar();
    updateMetrics();
}

function buildFileCardMarkup(file, index = 0) {
    const name = escapeHtml(file.name);
    const display = escapeHtml(getDisplayName(file.name));
    const kind = getFileKind(file);
    const rawUrl = getPublicUrl(file.name);
    const url = escapeHtml(rawUrl);
    const selected = state.selectedUploaded.has(file.name);
    const favorite = state.favoriteFiles.has(file.name);
    const mediaPriority = index < 6 ? 'loading="eager" fetchpriority="high" decoding="async"' : 'loading="lazy" fetchpriority="low" decoding="async"';
    const kindLabel = kind === "image" ? "Image" : kind === "video" ? "Video" : "File";
    const media = kind === "image"
        ? `<img src="${url}" alt="${display}" ${mediaPriority}>`
        : kind === "video"
            ? `<video src="${url}" muted playsinline preload="metadata"></video>`
            : `<div class="icon-asset">FILE</div>`;
    return `
        <article class="file-card file-card--${kind} reveal-on-scroll ${selected ? "is-selected" : ""}" data-name="${name}">
            <div class="file-card__controls">
                <label class="file-card__select" title="Select file">
                    <input class="file-card__check" type="checkbox" data-name="${name}" aria-label="Select ${display}" ${selected ? "checked" : ""}>
                </label>
                <div class="file-card__utility">
                    <button class="file-card__favorite ${favorite ? "is-favorite" : ""}" type="button" data-action="favorite" data-name="${name}" aria-pressed="${favorite}" aria-label="${favorite ? "Remove from" : "Add to"} favorites: ${display}" title="${favorite ? "Remove from" : "Add to"} favorites">${favorite ? "&#9733;" : "&#9734;"}</button>
                    <button class="file-card__menu" type="button" data-action="file-actions" data-name="${name}" aria-label="Actions for ${display}" title="File actions">&hellip;</button>
                </div>
            </div>
            <button class="file-card__viewer" type="button" data-action="open" data-name="${name}" aria-label="Open ${display}">
                <div class="file-card__media">
                    ${media}
                </div>
                <div class="file-card__body">
                    <h3 title="${display}">${display}</h3>
                    <p class="file-card__meta">${kindLabel} - ${formatGalleryDate(file.created_at || file.updated_at)} - ${formatBytes(getFileSize(file))}</p>
                </div>
            </button>
        </article>
    `;
}

function handleFilesListClick(event) {
    if (event.target.closest('[data-action="retry-library"]')) {
        return loadLibrary({ trigger: "load" });
    }
    const action = event.target.closest("[data-action]");
    if (action?.dataset.name) {
        const name = action.dataset.name;
        if (action.dataset.action === "open") return openMediaViewer(name);
        if (action.dataset.action === "file-actions") return openFileActions(name);
        if (action.dataset.action === "favorite") return toggleFavorite(name);
        return;
    }

    if (event.target.closest(".file-card__controls")) return;
    const card = event.target.closest(".file-card");
    if (card?.dataset.name && !event.target.closest("button, a")) {
        openMediaViewer(card.dataset.name);
    }
}

function handleFilesListContextMenu(event) {
    const card = event.target.closest(".file-card");
    if (!card?.dataset.name) return;
    event.preventDefault();
    openFileActions(card.dataset.name);
}

function openFileActions(fileName) {
    const file = state.files.find((entry) => entry.name === fileName);
    if (!file) return showMessage("That file is no longer available in the current library view.", "error");
    const display = getDisplayName(file.name);
    const kind = getFileKind(file);
    const rawUrl = getPublicUrl(file.name);
    const url = escapeHtml(rawUrl);
    const kindLabel = kind === "image" ? "Image" : kind === "video" ? "Video" : "File";
    const thumb = kind === "image"
        ? `<img src="${url}" alt="${escapeHtml(display)}" loading="eager" decoding="async" fetchpriority="high">`
        : kind === "video"
            ? `<video src="${url}" muted playsinline preload="metadata"></video>`
            : `<div class="icon-asset">FILE</div>`;

    state.actionTarget = file.name;
    elements.actionThumb.innerHTML = thumb;
    elements.actionName.textContent = display;
    elements.actionMeta.textContent = `${kindLabel} - ${formatBytes(getFileSize(file))} - ${formatDate(file.created_at || file.updated_at)}${state.selectedUploaded.has(file.name) ? " - Selected" : ""}`;
    syncActionSelection(file.name);
    openModal(elements.fileActionModal);
}

function handleFilesListChange(event) {
    const checkbox = event.target.closest(".file-card__check");
    if (!checkbox?.dataset.name) return;
    if (checkbox.checked) state.selectedUploaded.add(checkbox.dataset.name);
    else state.selectedUploaded.delete(checkbox.dataset.name);
    checkbox.closest(".file-card")?.classList.toggle("is-selected", checkbox.checked);
    updateSelectionToolbar();
}

function updateSelectionToolbar() {
    const visible = state.filteredFiles.slice(0, state.visibleCount);
    const allVisible = visible.length > 0 && visible.every((file) => state.selectedUploaded.has(file.name));
    elements.bulkActions.hidden = state.selectedUploaded.size === 0;
    elements.bulkCount.textContent = `${state.selectedUploaded.size} selected`;
    const selection = Array.from(state.selectedUploaded);
    elements.favoriteSelectedBtn.textContent = selection.length && selection.every((name) => state.favoriteFiles.has(name))
        ? "Unfavorite"
        : "Favorite";
    elements.selectVisibleBtn.disabled = !state.isLibraryLoaded || !visible.length;
    elements.selectVisibleBtn.textContent = allVisible ? "Clear Visible" : "Select Visible";
}

function toggleVisibleSelection() {
    const visible = state.filteredFiles.slice(0, state.visibleCount);
    if (!visible.length) return;
    const allVisible = visible.every((file) => state.selectedUploaded.has(file.name));
    visible.forEach((file) => allVisible ? state.selectedUploaded.delete(file.name) : state.selectedUploaded.add(file.name));
    renderLibrary();
}

function toggleFavorite(fileName) {
    const isFavorite = state.favoriteFiles.has(fileName);
    if (isFavorite) state.favoriteFiles.delete(fileName);
    else state.favoriteFiles.add(fileName);
    saveStoredFavorites();
    applyFilters(true);
    showMessage(isFavorite ? "Removed from favorites." : "Added to favorites.", "success", 1400);
}

function toggleSelectedFavorites() {
    const names = Array.from(state.selectedUploaded);
    if (!names.length) return;
    const remove = names.every((name) => state.favoriteFiles.has(name));
    names.forEach((name) => remove ? state.favoriteFiles.delete(name) : state.favoriteFiles.add(name));
    saveStoredFavorites();
    applyFilters(true);
    showMessage(remove ? "Removed selected files from favorites." : "Added selected files to favorites.", "success");
}

async function deleteFiles(fileNames) {
    if (!supabaseClient || !fileNames.length) return;
    setButtonLoading(elements.deleteSelectedBtn, true, "Deleting...");
    try {
        const results = await Promise.allSettled(fileNames.map((fileName) => deleteFileWithRequest(fileName)));
        const failed = results
            .map((result, index) => ({ result, fileName: fileNames[index] }))
            .filter(({ result }) => result.status === "rejected");
        const deletedCount = fileNames.length - failed.length;

        if (deletedCount > 0) {
            const deletedNames = new Set(
                results
                    .map((result, index) => ({ result, fileName: fileNames[index] }))
                    .filter(({ result }) => result.status === "fulfilled")
                    .map(({ fileName }) => fileName)
            );

            state.files = state.files.filter((file) => !deletedNames.has(file.name));
            state.filteredFiles = state.filteredFiles.filter((file) => !deletedNames.has(file.name));
            deletedNames.forEach((name) => state.selectedUploaded.delete(name));
            deletedNames.forEach((name) => state.favoriteFiles.delete(name));
            saveStoredFavorites();
            renderLibrary();
            if (state.isLibraryLoaded) {
                await loadLibrary({ silent: true, trigger: "refresh" });
            }
        }

        if (!failed.length) {
            showMessage(`Deleted ${deletedCount} file(s).`, "success");
            return;
        }

        const firstError = failed[0].result.reason;
        throw new Error(buildDeleteFailureMessage(deletedCount, failed.length, firstError));
    } catch (error) {
        console.error(error);
        showMessage(`Delete failed: ${error.message}`, "error", 6500);
    } finally {
        setButtonLoading(elements.deleteSelectedBtn, false);
    }
}

async function downloadSelectedFiles() {
    const names = Array.from(state.selectedUploaded);
    if (!names.length) return showMessage("Select at least one file to download.", "info");
    setButtonLoading(elements.downloadSelectedBtn, true, "Preparing...");
    try {
        for (const name of names) await downloadFile(name);
        showMessage(`Downloaded ${names.length} file(s).`, "success");
    } catch (error) {
        console.error(error);
        showMessage(`Download failed: ${error.message}`, "error", 6500);
    } finally {
        setButtonLoading(elements.downloadSelectedBtn, false);
    }
}

async function downloadFile(fileName) {
    if (!supabaseClient) throw new Error("Supabase is not available.");
    const { data, error } = await supabaseClient.storage.from(CONFIG.bucket).download(fileName);
    if (error) throw error;
    const objectUrl = URL.createObjectURL(data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = getDisplayName(fileName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

async function copyPublicLinks(fileNames) {
    if (!fileNames.length) return showMessage("Select at least one file first.", "info");
    const text = fileNames.map((name) => getPublicUrl(name)).join("\n");
    try {
        await writeClipboard(text);
        showMessage(`Copied ${fileNames.length} public link(s).`, "success");
    } catch {
        showMessage("Clipboard access was blocked. Try again in a secure browsing context.", "error");
    }
}

function showFileInfo(fileName) {
    const file = state.files.find((entry) => entry.name === fileName);
    if (!file) return showMessage("That file is no longer available in the current library view.", "error");
    const display = escapeHtml(getDisplayName(file.name));
    const url = escapeHtml(getPublicUrl(file.name));
    const kind = getFileKind(file);
    elements.fileInfoContent.innerHTML = `
        <div class="info-list">
            <div class="info-item"><strong>Name</strong><span>${display}</span></div>
            <div class="info-item"><strong>Stored Path</strong><span>${escapeHtml(file.name)}</span></div>
            <div class="info-item"><strong>Type</strong><span>${kind === "image" ? "Image" : kind === "video" ? "Video" : "File"}</span></div>
            <div class="info-item"><strong>Size</strong><span>${formatBytes(getFileSize(file))}</span></div>
            <div class="info-item"><strong>Created</strong><span>${formatDate(file.created_at || file.updated_at)}</span></div>
            <div class="info-item"><strong>Public URL</strong><a href="${url}" target="_blank" rel="noreferrer">${url}</a></div>
        </div>
    `;
    openModal(elements.fileInfoModal);
}

function openMediaViewer(fileName) {
    const file = state.files.find((entry) => entry.name === fileName);
    if (!file) return showMessage("That file is no longer available in the current library view.", "error");

    const display = getDisplayName(file.name);
    const kind = getFileKind(file);
    const rawUrl = getPublicUrl(file.name);
    const url = escapeHtml(rawUrl);

    state.viewerTarget = file.name;
    state.viewerLoadToken += 1;
    stopViewerPlayback();
    revokeViewerObjectUrl();
    applyViewerShellFormat(null);
    elements.viewerKindPill.textContent = kind === "image" ? "Image" : kind === "video" ? "Video" : "File";
    elements.viewerName.textContent = display;
    elements.viewerMeta.textContent = `${formatBytes(getFileSize(file))} - ${formatDate(file.created_at || file.updated_at)}`;
    elements.viewerNote.textContent = kind === "video"
        ? "Starting video playback..."
        : kind === "image"
            ? "Opening full-frame image preview."
            : "Open the public file link from the information panel if you need more actions.";
    openModal(elements.viewerModal);

    if (kind === "image") {
        elements.viewerStage.innerHTML = `
            <div class="viewer-stage__frame is-image">
                <img src="${url}" alt="${escapeHtml(display)}" loading="eager" decoding="async" fetchpriority="high">
            </div>
        `;
        const image = elements.viewerStage.querySelector("img");
        if (image) attachViewerFormat(image, "image");
        return;
    }

    if (kind === "video") {
        elements.viewerStage.innerHTML = `<div class="viewer-stage__frame is-video"></div>`;
        hydrateViewerVideo(file, rawUrl, display, state.viewerLoadToken);
        return;
    }

    elements.viewerStage.innerHTML = `<div class="viewer-stage__fallback"><div class="icon-asset">FILE</div><p>Preview is not available for this file type.</p></div>`;
}

function hydrateViewerVideo(file, url, display, loadToken) {
    if (loadToken !== state.viewerLoadToken || state.viewerTarget !== file.name) return;
    const frame = elements.viewerStage.querySelector(".viewer-stage__frame");
    if (!frame) return;

    const viewerVideo = document.createElement("video");
    viewerVideo.controls = true;
    viewerVideo.playsInline = true;
    viewerVideo.preload = "auto";
    viewerVideo.setAttribute("controlslist", "nodownload");
    viewerVideo.setAttribute("aria-label", display);
    viewerVideo.addEventListener("error", () => {
        if (loadToken !== state.viewerLoadToken || state.viewerTarget !== file.name) return;
        elements.viewerNote.textContent = "This video could not be loaded. Try opening the public file link.";
        console.error("Video playback failed.", viewerVideo.error);
    }, { once: true });
    viewerVideo.src = url;
    frame.appendChild(viewerVideo);
    attachViewerFormat(viewerVideo, "video");

    viewerVideo.play().catch((error) => {
        if (loadToken !== state.viewerLoadToken || state.viewerTarget !== file.name) return;
        if (viewerVideo.error || error.name === "AbortError") return;
        if (error.name === "NotAllowedError") {
            elements.viewerNote.textContent = "Tap play to start the video.";
        } else if (!viewerVideo.error) {
            elements.viewerNote.textContent = "Playback could not start. Tap play to retry.";
        }
    });
}

function attachViewerFormat(media, kind) {
    const applyFormat = () => {
        const frame = elements.viewerStage.querySelector(".viewer-stage__frame");
        if (!media.isConnected || !frame?.contains(media)) return;
        const width = kind === "video" ? media.videoWidth : media.naturalWidth;
        const height = kind === "video" ? media.videoHeight : media.naturalHeight;
        if (!width || !height) return;

        frame.classList.remove("is-portrait", "is-square", "is-landscape");
        const ratio = width / height;
        const format = ratio < 0.88 ? "portrait" : ratio > 1.12 ? "landscape" : "square";
        frame.classList.add(`is-${format}`);
        applyViewerShellFormat(format);
        elements.viewerStage.style.setProperty("--viewer-media-ratio", `${width} / ${height}`);
        elements.viewerStage.style.setProperty("--viewer-media-width", `${width}`);
        elements.viewerStage.style.setProperty("--viewer-media-height", `${height}`);
        frame.style.setProperty("--viewer-media-ratio", `${width} / ${height}`);
        frame.style.setProperty("--viewer-media-width", `${width}`);
        frame.style.setProperty("--viewer-media-height", `${height}`);
        setViewerFormatNote(kind, format);
    };

    if (kind === "video") {
        if (media.readyState >= 1) applyFormat();
        else media.addEventListener("loadedmetadata", applyFormat, { once: true });
        return;
    }

    if (media.complete) applyFormat();
    else media.addEventListener("load", applyFormat, { once: true });
}

function applyViewerShellFormat(format) {
    if (!elements.viewerPanel) return;
    elements.viewerPanel.classList.remove("is-portrait", "is-square", "is-landscape");
    if (format) elements.viewerPanel.classList.add(`is-${format}`);
}

function setViewerFormatNote(kind, format, tail = "") {
    const base = kind === "video"
        ? format === "portrait"
            ? "Portrait video shown in a tall viewer layout."
            : format === "square"
                ? "Square video shown in a balanced centered viewer."
                : "Landscape video shown in a wide viewer layout."
        : format === "portrait"
            ? "Portrait image shown in a tall viewer layout."
            : format === "square"
                ? "Square image shown in a balanced centered viewer."
                : "Landscape image shown in a wide viewer layout.";
    elements.viewerNote.textContent = tail ? `${base} ${tail}` : base;
}

function openRenameModal(fileName) {
    const file = state.files.find((entry) => entry.name === fileName);
    if (!file) return showMessage("That file is no longer available in the current library view.", "error");
    const displayName = getDisplayName(file.name);
    const { stem } = splitFileNameParts(displayName);
    state.renameTarget = file.name;
    elements.renameCurrentName.textContent = displayName;
    elements.renameInput.value = stem;
    openModal(elements.renameModal);
    elements.renameInput.focus();
    elements.renameInput.select();
}

async function submitRename() {
    if (!supabaseClient) return showMessage("Supabase is not available. Rename cannot start.", "error");
    if (!state.renameTarget) return;
    const file = state.files.find((entry) => entry.name === state.renameTarget);
    if (!file) {
        closeModal(elements.renameModal);
        return showMessage("That file could not be found. Refresh the library and try again.", "error");
    }

    const requestedBaseName = elements.renameInput.value.trim().replace(/\s+/g, " ");
    if (!requestedBaseName) {
        elements.renameInput.focus();
        return showMessage("Enter a new file name before saving.", "info");
    }

    const originalDisplayName = getDisplayName(file.name);
    const { extension } = splitFileNameParts(originalDisplayName);
    const renamedDisplayName = `${requestedBaseName}${extension}`;
    if (sanitizeFileName(renamedDisplayName) === sanitizeFileName(originalDisplayName)) {
        closeModal(elements.renameModal);
        return showMessage("The file name is already the same.", "info");
    }

    const nextPath = buildStoragePath(renamedDisplayName);
    const wasSelected = state.selectedUploaded.has(file.name);
    const wasFavorite = state.favoriteFiles.has(file.name);
    setButtonLoading(elements.renameSubmitBtn, true, "Renaming...");

    try {
        const { data, error } = await supabaseClient.storage.from(CONFIG.bucket).download(file.name);
        if (error) throw error;

        const { error: uploadError } = await supabaseClient.storage.from(CONFIG.bucket).upload(nextPath, data, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.metadata?.mimetype || data.type || "application/octet-stream"
        });
        if (uploadError) throw uploadError;

        try {
            await deleteFileWithRequest(file.name);
        } catch (deleteError) {
            state.selectedUploaded.delete(file.name);
            if (wasSelected) state.selectedUploaded.add(nextPath);
            closeModal(elements.renameModal);
            await loadLibrary({ silent: true, trigger: "refresh" });
            showMessage(`Renamed copy created as ${getDisplayName(nextPath)}, but the old file could not be deleted. Remove it manually.`, "error", 7000);
            return;
        }

        state.selectedUploaded.delete(file.name);
        if (wasSelected) state.selectedUploaded.add(nextPath);
        if (wasFavorite) {
            state.favoriteFiles.delete(file.name);
            state.favoriteFiles.add(nextPath);
            saveStoredFavorites();
        }
        closeModal(elements.renameModal);
        await loadLibrary({ silent: true, trigger: "refresh" });
        showMessage(`Renamed to ${getDisplayName(nextPath)}.`, "success");
    } catch (error) {
        console.error(error);
        showMessage(`Rename failed: ${error.message}`, "error", 6500);
    } finally {
        setButtonLoading(elements.renameSubmitBtn, false);
    }
}

async function showStats() {
    if (!state.isLibraryLoaded) await loadLibrary({ silent: true, trigger: "load" });
    if (!state.isLibraryLoaded) return;
    const totalFiles = state.files.length;
    const totalSize = getTotalLibrarySize();
    const images = state.files.filter((file) => getFileKind(file) === "image").length;
    const videos = state.files.filter((file) => getFileKind(file) === "video").length;
    const average = totalFiles ? totalSize / totalFiles : 0;
    const largest = state.files.reduce((best, file) => getFileSize(file) > getFileSize(best) ? file : best, state.files[0] || {});
    const usagePercent = CONFIG.storageQuotaBytes ? ((totalSize / CONFIG.storageQuotaBytes) * 100).toFixed(2) : "0.00";
    elements.statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stats-card"><strong>${totalFiles}</strong><span>Total files</span></div>
            <div class="stats-card"><strong>${formatBytes(totalSize)}</strong><span>Total storage used</span></div>
            <div class="stats-card"><strong>${images}</strong><span>Images</span></div>
            <div class="stats-card"><strong>${videos}</strong><span>Videos</span></div>
            <div class="stats-card"><strong>${formatBytes(average)}</strong><span>Average file size</span></div>
            <div class="stats-card"><strong>${usagePercent}%</strong><span>Of the configured ${formatBytes(CONFIG.storageQuotaBytes)} quota</span></div>
        </div>
        <div class="info-list">
            <div class="info-item"><strong>Largest file</strong><span>${largest.name ? `${escapeHtml(getDisplayName(largest.name))} - ${formatBytes(getFileSize(largest))}` : "No files available"}</span></div>
            <div class="info-item"><strong>Queue status</strong><span>${state.queue.filter((item) => item.selected).length} of ${state.queue.length} staged file(s) selected</span></div>
        </div>
    `;
    openModal(elements.statsModal);
}

function exportLibrary() {
    if (!state.isLibraryLoaded || !state.files.length) return showMessage("Load the library before exporting the file list.", "info");
    const rows = [
        ["display_name", "storage_name", "type", "size_bytes", "created_at", "public_url"],
        ...state.files.map((file) => [getDisplayName(file.name), file.name, getFileKind(file), String(getFileSize(file)), file.created_at || file.updated_at || "", getPublicUrl(file.name)])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    downloadTextFile(csv, `my-cloud-service-export-${Date.now()}.csv`, "text/csv;charset=utf-8");
    showMessage("Library export generated.", "success");
}

function handleKeyboardShortcuts(event) {
    if (event.key === "Escape") return closeAllModals();
    if (event.key === "Tab" && trapModalFocus(event)) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (isEditableTarget(event.target) && key !== "f") return;
    if (key === "u") {
        event.preventDefault();
        if (!state.isUploading) elements.fileInput.click();
    }
    if (key === "s") {
        event.preventDefault();
        loadLibrary({ trigger: "load" });
    }
    if (key === "d") {
        event.preventDefault();
        applyTheme(state.theme === "dark" ? "light" : "dark", true);
    }
    if (key === "f") {
        event.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
    }
}

function openModal(modal) {
    if (!modal) return;
    if (!getOpenModal()) state.modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    if (modal === elements.settingsModal) {
        modal.querySelector(".modal__body").scrollTop = 0;
    }
    document.body.style.overflow = "hidden";
    modal.querySelector("button, input, select, textarea, [href]")?.focus();
}

function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (modal === elements.renameModal) resetRenameForm();
    if (modal === elements.viewerModal) resetViewer();
    if (modal === elements.fileActionModal) resetFileActions();
    if (![elements.settingsModal, elements.fileInfoModal, elements.statsModal, elements.viewerModal, elements.fileActionModal, elements.renameModal].some((entry) => entry && !entry.hidden)) {
        document.body.style.overflow = "";
        const returnFocus = state.modalReturnFocus;
        state.modalReturnFocus = null;
        if (returnFocus?.isConnected && typeof returnFocus.focus === "function") returnFocus.focus();
    }
}

function closeAllModals() {
    closeModal(elements.settingsModal);
    closeModal(elements.fileInfoModal);
    closeModal(elements.statsModal);
    closeModal(elements.viewerModal);
    closeModal(elements.fileActionModal);
    closeModal(elements.renameModal);
}

function getOpenModal() {
    return [elements.settingsModal, elements.fileInfoModal, elements.statsModal, elements.viewerModal, elements.fileActionModal, elements.renameModal]
        .find((modal) => modal && !modal.hidden) || null;
}

function trapModalFocus(event) {
    const modal = getOpenModal();
    if (!modal) return false;
    const focusable = Array.from(modal.querySelectorAll("button, input, select, textarea, a[href], [tabindex]:not([tabindex=\"-1\"])"))
        .filter((node) => !node.disabled && node.offsetParent !== null);
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
        return true;
    }
    return false;
}

function isEditableTarget(target) {
    return target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable=\"true\"]");
}

function setupInfiniteScroll() {
    if (!("IntersectionObserver" in window)) return;
    state.observer = new IntersectionObserver((entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (!state.isLibraryLoaded || state.visibleCount >= state.filteredFiles.length) return;
        state.visibleCount += CONFIG.pageSize;
        renderLibrary();
    }, { rootMargin: "220px 0px" });
    state.observer.observe(elements.loadMoreSentinel);
}

function setupRevealObserver() {
    disconnectRevealObserver();
    if (state.settings.reduceMotion || !("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal-on-scroll").forEach((node) => node.classList.add("is-visible"));
        return;
    }
    state.revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            state.revealObserver?.unobserve(entry.target);
        });
    }, {
        threshold: 0.16,
        rootMargin: "0px 0px -6% 0px"
    });
    observeRevealTargets();
}

function observeRevealTargets(scope = document) {
    const targets = scope.querySelectorAll ? scope.querySelectorAll(".reveal-on-scroll:not(.is-visible)") : [];
    if (!targets.length) return;
    if (!state.revealObserver) {
        targets.forEach((node) => node.classList.add("is-visible"));
        return;
    }
    targets.forEach((node) => state.revealObserver.observe(node));
}

function disconnectRevealObserver() {
    if (!state.revealObserver) return;
    state.revealObserver.disconnect();
    state.revealObserver = null;
}

function updateMetrics() {
    elements.queueMetric.textContent = `${state.queue.length} file${state.queue.length === 1 ? "" : "s"}`;
    elements.libraryMetric.textContent = `${state.files.length} file${state.files.length === 1 ? "" : "s"}`;
    elements.usageMetric.textContent = formatBytes(getTotalLibrarySize());
}

function removeQueueItems(ids) {
    const idSet = new Set(ids);
    state.queue = state.queue.filter((item) => {
        if (idSet.has(item.id)) {
            URL.revokeObjectURL(item.previewUrl);
            return false;
        }
        return true;
    });
    renderQueue();
}

function getTotalLibrarySize() {
    return state.files.reduce((sum, file) => sum + getFileSize(file), 0);
}

function getFileSize(file) {
    return Number(file?.metadata?.size) || 0;
}

function getFileKind(file) {
    const name = file?.name || "";
    const mime = file?.metadata?.mimetype || file?.type || "";
    if (mime.startsWith("image/") || /\.(avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)$/i.test(name)) return "image";
    if (mime.startsWith("video/") || /\.(m4v|mov|mp4|ogg|webm)$/i.test(name)) return "video";
    return "file";
}

function isSupportedFile(file) {
    const kind = getFileKind(file);
    return kind === "image" || kind === "video";
}

function canCompress(file) {
    return getFileKind(file) === "image" && !/\.gif$/i.test(file.name);
}

async function compressImageFile(file) {
    try {
        const raster = await loadRasterSource(file);
        const maxDimension = 2560;
        const scale = Math.min(1, maxDimension / Math.max(raster.width, raster.height));
        const width = Math.max(1, Math.round(raster.width * scale));
        const height = Math.max(1, Math.round(raster.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
            raster.cleanup();
            return file;
        }
        context.drawImage(raster.source, 0, 0, width, height);
        raster.cleanup();
        const outputType = file.type === "image/png" || file.type === "image/webp" ? "image/webp" : "image/jpeg";
        const quality = file.size > 8 * 1024 * 1024 ? 0.68 : file.size > 3 * 1024 * 1024 ? 0.76 : 0.84;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
        if (!blob || blob.size >= file.size * 0.98) return file;
        return new File([blob], replaceExtension(file.name, mimeToExtension(outputType)), { type: outputType, lastModified: file.lastModified });
    } catch (error) {
        console.warn("Compression skipped:", error);
        return file;
    }
}

async function loadRasterSource(file) {
    if ("createImageBitmap" in window) {
        const bitmap = await createImageBitmap(file);
        return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            cleanup() {
                if (typeof bitmap.close === "function") bitmap.close();
            }
        };
    }
    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image preview could not be loaded."));
        img.src = objectUrl;
    });
    return {
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        cleanup() {
            URL.revokeObjectURL(objectUrl);
        }
    };
}

function buildStoragePath(name) {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}__${sanitizeFileName(name)}`;
}

function sanitizeFileName(name) {
    return name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "file";
}

function getDisplayName(name) {
    const marker = "__";
    const index = name.indexOf(marker);
    return index === -1 ? name : name.slice(index + marker.length);
}

function splitFileNameParts(name) {
    const trimmed = String(name || "").trim();
    const lastDot = trimmed.lastIndexOf(".");
    if (lastDot <= 0) return { stem: trimmed, extension: "" };
    return {
        stem: trimmed.slice(0, lastDot),
        extension: trimmed.slice(lastDot)
    };
}

function matchesFileFilter(file, query, filter) {
    const kind = getFileKind(file);
    const matchesQuery = getDisplayName(file.name).toLowerCase().includes(query);
    const matchesFilter = filter === "all"
        || (filter === "favorite" ? state.favoriteFiles.has(file.name) : filter === kind);
    return matchesQuery && matchesFilter;
}

function getPublicUrl(fileName) {
    if (!supabaseClient) return "";
    return supabaseClient.storage.from(CONFIG.bucket).getPublicUrl(fileName).data.publicUrl;
}

function getEmptyStateMarkup(kind, title, description) {
    const icons = {
        queue: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M7 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
        library: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h9A2.75 2.75 0 0 1 19.25 7.75v8.5A2.75 2.75 0 0 1 16.5 19h-9a2.75 2.75 0 0 1-2.75-2.75z" stroke="currentColor" stroke-width="1.8"/>
                <path d="M8 14l2.2-2.2a1 1 0 0 1 1.4 0L14 14.2l1.4-1.4a1 1 0 0 1 1.4 0L19 14.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
            </svg>
        `,
        search: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="5.5" stroke="currentColor" stroke-width="1.8"/>
                <path d="M15.2 15.2L19 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `,
        error: `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 4.5l8 14a1.25 1.25 0 0 1-1.08 1.88H5.08A1.25 1.25 0 0 1 4 18.5l8-14z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M12 9v4.5M12 16.5h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
        `
    };

    const action = kind === "error"
        ? `<button class="button ghost compact empty-state__action" type="button" data-action="retry-library">Try again</button>`
        : "";

    return `
        <div class="empty-state">
            <div class="empty-state__icon" aria-hidden="true">${icons[kind] || icons.queue}</div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(description)}</p>
            ${action}
        </div>
    `;
}

async function deleteFileWithRequest(fileName) {
    const bucket = encodeURIComponent(CONFIG.bucket);
    const path = fileName.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${CONFIG.supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
        method: "DELETE",
        headers: {
            apikey: CONFIG.supabasePublishableKey,
            Authorization: `Bearer ${CONFIG.supabaseAnonKey}`
        }
    });

    if (response.ok) {
        return;
    }

    const responseText = await response.text();
    throw new Error(parseSupabaseError(responseText) || `Delete failed with status ${response.status}.`);
}

function buildDeleteFailureMessage(deletedCount, failedCount, error) {
    const rawMessage = error?.message || "Unknown delete error.";
    const needsPolicyHint = /row-level security|permission|not allowed|403|unauthorized|access denied/i.test(rawMessage);
    const summary = deletedCount > 0
        ? `${deletedCount} deleted, ${failedCount} failed.`
        : `Unable to delete ${failedCount} file(s).`;

    if (needsPolicyHint) {
        return `${summary} Supabase is blocking anonymous deletes. Re-run supabase_setup.sql, then try again.`;
    }

    return `${summary} ${rawMessage}`;
}

function uploadFileWithProgress(job, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const releaseRequest = () => state.activeUploadRequests.delete(xhr);
        const bucket = encodeURIComponent(CONFIG.bucket);
        const path = job.path.split("/").map(encodeURIComponent).join("/");
        xhr.open("POST", `${CONFIG.supabaseUrl}/storage/v1/object/${bucket}/${path}`);
        xhr.setRequestHeader("apikey", CONFIG.supabasePublishableKey);
        xhr.setRequestHeader("Authorization", `Bearer ${CONFIG.supabaseAnonKey}`);
        xhr.setRequestHeader("x-upsert", "false");
        xhr.setRequestHeader("cache-control", "3600");
        xhr.setRequestHeader("content-type", job.file.type || "application/octet-stream");
        xhr.upload.addEventListener("progress", (event) => event.lengthComputable && onProgress(event.loaded));
        xhr.addEventListener("load", () => {
            releaseRequest();
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    return resolve(xhr.responseText ? JSON.parse(xhr.responseText) : {});
                } catch {
                    return resolve({});
                }
            }
            reject(new Error(parseSupabaseError(xhr.responseText) || `Upload failed with status ${xhr.status}.`));
        });
        xhr.addEventListener("error", () => {
            releaseRequest();
            reject(new Error("A network error interrupted the upload."));
        });
        xhr.addEventListener("abort", () => {
            releaseRequest();
            reject(new Error("Upload cancelled."));
        });
        state.activeUploadRequests.add(xhr);
        xhr.send(job.file);
    });
}

function parseSupabaseError(text) {
    if (!text) return "";
    try {
        const parsed = JSON.parse(text);
        return parsed.message || parsed.error || parsed.msg || "";
    } catch {
        return text;
    }
}

function writeClipboard(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const ok = document.execCommand("copy");
            textarea.remove();
            ok ? resolve() : reject(new Error("Copy failed."));
        } catch (error) {
            textarea.remove();
            reject(error);
        }
    });
}

function showMessage(text, type = "info", duration = CONFIG.messageMs) {
    clearTimeout(state.messageTimer);
    elements.message.hidden = false;
    elements.message.className = `toast ${type}`;
    elements.message.setAttribute("role", type === "error" ? "alert" : "status");
    elements.message.textContent = text;
    if (duration > 0) {
        state.messageTimer = window.setTimeout(() => {
            elements.message.hidden = true;
            elements.message.className = "toast";
            elements.message.setAttribute("role", "status");
            elements.message.textContent = "";
        }, duration);
    }
}

function resetRenameForm() {
    state.renameTarget = null;
    elements.renameCurrentName.textContent = "-";
    elements.renameInput.value = "";
}

function resetFileActions() {
    state.actionTarget = null;
    elements.actionThumb.innerHTML = "";
    elements.actionName.textContent = "Selected file";
    elements.actionMeta.textContent = "Choose what you want to do with this media.";
    elements.actionSelectBtn.textContent = "Select";
    elements.actionSelectBtn.classList.remove("is-active");
}

function syncActionSelection(fileName) {
    const isSelected = state.selectedUploaded.has(fileName);
    elements.actionSelectBtn.textContent = isSelected ? "Selected" : "Select";
    elements.actionSelectBtn.classList.toggle("is-active", isSelected);
}

function stopViewerPlayback() {
    elements.viewerStage.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.querySelectorAll("source").forEach((source) => source.removeAttribute("src"));
        video.load();
    });
}

function resetViewer() {
    state.viewerTarget = null;
    state.viewerLoadToken += 1;
    stopViewerPlayback();
    revokeViewerObjectUrl();
    applyViewerShellFormat(null);
    elements.viewerStage.style.removeProperty("--viewer-media-ratio");
    elements.viewerStage.style.removeProperty("--viewer-media-width");
    elements.viewerStage.style.removeProperty("--viewer-media-height");
    elements.viewerStage.innerHTML = "";
    elements.viewerKindPill.textContent = "File";
    elements.viewerName.textContent = "Preview";
    elements.viewerMeta.textContent = "Choose a file to view.";
    elements.viewerNote.textContent = "Open images and videos at full frame with no crop.";
}

function revokeViewerObjectUrl() {
    if (!state.viewerObjectUrl) return;
    URL.revokeObjectURL(state.viewerObjectUrl);
    state.viewerObjectUrl = null;
}

function setButtonLoading(button, isLoading, busyText = "Loading...") {
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    if (isLoading) {
        button.style.width = `${Math.ceil(button.getBoundingClientRect().width)}px`;
        button.classList.add("is-loading");
        button.setAttribute("aria-busy", "true");
        button.setAttribute("aria-label", busyText);
        button.disabled = true;
        button.textContent = button.dataset.defaultText;
        return;
    }
    button.disabled = false;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
    button.removeAttribute("aria-label");
    button.textContent = button.dataset.defaultText;
    button.style.width = "";
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** exp);
    return `${value.toFixed(value >= 100 || exp === 0 ? 0 : 1)} ${units[exp]}`;
}

function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "--";
    const total = Math.ceil(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hours) return `${hours}h ${minutes}m`;
    if (minutes) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

function formatDate(value) {
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function formatGalleryDate(value) {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeCsv(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadTextFile(text, fileName, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

function replaceExtension(name, ext) {
    return `${name.replace(/\.[^.]+$/, "")}.${ext}`;
}

function mimeToExtension(mime) {
    if (mime === "image/webp") return "webp";
    if (mime === "image/jpeg") return "jpg";
    return "bin";
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) return;
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {}));
}
