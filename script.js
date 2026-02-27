let currentLink = "";
let currentStyle = {
    size: 220,
    color: "#000000",
    background: "#ffffff",
    borderRadius: 8,
    ecc: "L",
    qzone: 0
};

let editingStyle = null;

function hexToRgbParam(hex) {
    if (!hex) return "0-0-0";
    let cleaned = hex.replace("#", "");
    if (cleaned.length === 3) {
        cleaned = cleaned.split("").map(ch => ch + ch).join("");
    }
    const r = parseInt(cleaned.substring(0, 2), 16) || 0;
    const g = parseInt(cleaned.substring(2, 4), 16) || 0;
    const b = parseInt(cleaned.substring(4, 6), 16) || 0;
    return `${r}-${g}-${b}`;
}

function actualizarQR(styleOverride, targetId = "qrImage") {
    const qrImage = document.getElementById(targetId);
    const placeholder = document.getElementById("qrPlaceholder");
    const downloadBtn = document.getElementById("downloadBtn");
    const editStyleBtn = document.getElementById("editStyleBtn");

    if (!currentLink.trim() || !qrImage) {
        return;
    }

    const style = styleOverride || currentStyle;

    const size = style.size || 220;
    const colorParam = hexToRgbParam(style.color);
    const bgParam = hexToRgbParam(style.background);
    const ecc = style.ecc || "L";
    const qzone = typeof style.qzone === "number" ? style.qzone : 0;

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(currentLink)}&color=${colorParam}&bgcolor=${bgParam}&ecc=${ecc}&qzone=${qzone}`;

    qrImage.src = apiUrl;
    qrImage.style.display = "block";
    qrImage.style.borderRadius = (style.borderRadius || 0) + "px";

    // Solo el QR principal controla placeholder y botones
    if (targetId === "qrImage") {
        if (placeholder) placeholder.style.display = "none";
        if (downloadBtn) downloadBtn.style.display = "inline-block";
        if (editStyleBtn) editStyleBtn.style.display = "inline-block";
    }
}

function generarQR() {
    const link = document.getElementById("linkInput").value;
    if (link.trim() === "") {
        alert("Por favor, ingresa un enlace válido.");
        return;
    }

    currentLink = link;
    actualizarQR();
}

async function descargarQR() {
    const qrImage = document.getElementById("qrImage");
    if (!qrImage || !qrImage.src) {
        return;
    }

    try {
        const response = await fetch(qrImage.src, { mode: "cors" });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "codigo-qr.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert("No se pudo descargar la imagen del QR automáticamente. Intenta guardarla manualmente.");
    }
}

function abrirModalEstilo() {
    if (!currentLink.trim()) {
        alert("Primero genera un código QR antes de editar el estilo.");
        return;
    }

    const modal = document.getElementById("styleModal");
    const colorInput = document.getElementById("qrColorInput");
    const bgInput = document.getElementById("qrBgColorInput");
    const eccSelect = document.getElementById("qrEccSelect");
    const sizeInput = document.getElementById("qrSizeInput");
    const radiusInput = document.getElementById("qrRadiusInput");
    const qzoneInput = document.getElementById("qrQzoneInput");

    // Copiamos el estilo actual a un estilo de edición temporal
    editingStyle = { ...currentStyle };

    if (colorInput) colorInput.value = editingStyle.color || "#000000";
    if (bgInput) bgInput.value = editingStyle.background || "#ffffff";
    if (eccSelect) eccSelect.value = editingStyle.ecc || "L";
    if (sizeInput) sizeInput.value = editingStyle.size || 220;
    if (radiusInput) radiusInput.value = editingStyle.borderRadius || 0;
    if (qzoneInput) qzoneInput.value = typeof editingStyle.qzone === "number" ? editingStyle.qzone : 0;

    actualizarEtiquetaTamano();
    actualizarEtiquetaRadio();
    actualizarEtiquetaQzone();

    modal.classList.add("is-visible");

    // Mostrar vista previa inicial dentro de la modal
    actualizarQR(editingStyle, "qrPreviewImage");
}

function cerrarModalEstilo() {
    const modal = document.getElementById("styleModal");
    modal.classList.remove("is-visible");
    editingStyle = null;
}

function actualizarEtiquetaTamano() {
    const sizeInput = document.getElementById("qrSizeInput");
    const sizeLabel = document.getElementById("qrSizeValue");
    if (sizeInput && sizeLabel) {
        sizeLabel.textContent = `${sizeInput.value} px`;
    }
}

function actualizarEtiquetaRadio() {
    const radiusInput = document.getElementById("qrRadiusInput");
    const radiusLabel = document.getElementById("qrRadiusValue");
    if (radiusInput && radiusLabel) {
        radiusLabel.textContent = `${radiusInput.value} px`;
    }
}

function guardarEstiloQR() {
    const colorInput = document.getElementById("qrColorInput");
    const bgInput = document.getElementById("qrBgColorInput");
    const sizeInput = document.getElementById("qrSizeInput");
    const radiusInput = document.getElementById("qrRadiusInput");
    const eccSelect = document.getElementById("qrEccSelect");
    const qzoneInput = document.getElementById("qrQzoneInput");

    if (!editingStyle) {
        cerrarModalEstilo();
        return;
    }

    // Persistimos el estilo que se estaba previsualizando
    if (colorInput) editingStyle.color = colorInput.value || "#000000";
    if (bgInput) editingStyle.background = bgInput.value || "#ffffff";
    if (eccSelect) editingStyle.ecc = eccSelect.value || "L";
    if (sizeInput) editingStyle.size = parseInt(sizeInput.value, 10) || 220;
    if (radiusInput) editingStyle.borderRadius = parseInt(radiusInput.value, 10) || 0;
    if (qzoneInput) editingStyle.qzone = parseInt(qzoneInput.value, 10);

    currentStyle = { ...editingStyle };

    cerrarModalEstilo();
    actualizarQR();
}

function aplicarCambiosEnVivo() {
    if (!editingStyle) return;

    const colorInput = document.getElementById("qrColorInput");
    const bgInput = document.getElementById("qrBgColorInput");
    const sizeInput = document.getElementById("qrSizeInput");
    const radiusInput = document.getElementById("qrRadiusInput");
    const eccSelect = document.getElementById("qrEccSelect");
    const qzoneInput = document.getElementById("qrQzoneInput");

    if (colorInput) editingStyle.color = colorInput.value || editingStyle.color;
    if (bgInput) editingStyle.background = bgInput.value || editingStyle.background;
    if (sizeInput) editingStyle.size = parseInt(sizeInput.value, 10) || editingStyle.size;
    if (radiusInput) editingStyle.borderRadius = parseInt(radiusInput.value, 10) || editingStyle.borderRadius;
    if (eccSelect) editingStyle.ecc = eccSelect.value || editingStyle.ecc;
    if (qzoneInput) editingStyle.qzone = parseInt(qzoneInput.value, 10);

    actualizarQR(editingStyle, "qrPreviewImage");
}

function actualizarEtiquetaQzone() {
    const qzoneInput = document.getElementById("qrQzoneInput");
    const qzoneLabel = document.getElementById("qrQzoneValue");
    if (qzoneInput && qzoneLabel) {
        qzoneLabel.textContent = qzoneInput.value;
    }
}
