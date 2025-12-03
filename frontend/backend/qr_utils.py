import uuid
import qrcode
import base64
from io import BytesIO

def generate_qr_code(record_type: str, record_id: int) -> tuple[str, str]:
    """
    Generate a unique QR code for a booking or volunteer record.
    
    Args:
        record_type: "booking" or "volunteer"
        record_id: ID of the booking/volunteer record
        
    Returns:
        tuple: (qr_data_string, base64_image_string)
    """
    # Create unique QR data: "type:id:token"
    token = uuid.uuid4().hex[:12]
    qr_data =f"{record_type}:{record_id}:{token}"
    
    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64 for embedding in HTML/JSON
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    return qr_data, f"data:image/png;base64,{img_base64}"
