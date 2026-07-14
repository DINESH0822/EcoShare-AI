import { useState, useEffect, useRef } from "react";
import { initFirebase } from "../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import toast from "react-hot-toast";

function PhoneVerification({ onVerify }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);

  const otpInputsRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (isOtpSent && timer > 0 && !verified) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isOtpSent, timer, verified]);

  // Clean up reCAPTCHA verifier if component unmounts
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  // Validate phone input
  const validatePhone = (num) => {
    return /^[6-9]\d{9}$/.test(num);
  };

  // Send OTP trigger
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number starting with 6-9");
      return;
    }

    setLoading(true);
    try {
      const auth = await initFirebase();

      if (auth.isSimulation) {
        setIsSimulatedMode(true);
        setIsOtpSent(true);
        setTimer(30);
        toast.success("🔑 Simulation: OTP sent! Use verification code '123456'.", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      setIsSimulatedMode(false);

      // Initialize invisible reCAPTCHA verifier
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              // recaptcha solved, will proceed to signInWithPhoneNumber
            },
            "expired-callback": () => {
              toast.error("reCAPTCHA expired. Please try again.");
              setLoading(false);
            }
          }
        );
      }

      const phoneNumber = `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current
      );

      setVerificationResult(confirmationResult);
      setIsOtpSent(true);
      setTimer(30);
      toast.success("📲 OTP sent to your mobile number.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send OTP. Please check your number.");
      // Reset recaptcha verifier
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP logic
  const handleResendOtp = () => {
    if (resendAttempts >= 3) {
      toast.error("Maximum OTP resend attempts reached. Please register again later.");
      return;
    }
    setResendAttempts((prev) => prev + 1);
    setOtp(new Array(6).fill(""));
    handleSendOtp();
  };

  // OTP inputs handling (auto-tabbing)
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // take only last digit if pasted/typed multiple
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 boxes are filled
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return;

    const newOtp = data.split("");
    setOtp(newOtp);
    otpInputsRef.current[5]?.focus();
    verifyOtpCode(data);
  };

  // Verify code
  const verifyOtpCode = async (code) => {
    setLoading(true);
    try {
      let uid = "simulated_user_uid";
      
      if (isSimulatedMode) {
        // Simulated Verification
        await new Promise((r) => setTimeout(r, 1000)); // loading feel
        if (code !== "123456") {
          throw new Error("Invalid OTP verification code entered.");
        }
      } else {
        // Firebase verification
        if (!verificationResult) {
          throw new Error("Verification session not found. Please resend OTP.");
        }
        const credentialResult = await verificationResult.confirm(code);
        uid = credentialResult.user.uid;
      }

      setVerified(true);
      toast.success("✅ Phone number verified successfully!");
      
      // Notify parent component
      onVerify({
        phone,
        isVerified: true,
        verificationTime: new Date(),
        firebaseUid: uid
      });

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Incorrect OTP. Please try again.");
      setOtp(new Array(6).fill(""));
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <label className="eco-label" htmlFor="pv-phone">📞 Mobile Number</label>
      
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            color: "#64748b", fontSize: "0.95rem", fontWeight: "600"
          }}>+91</span>
          <input
            id="pv-phone"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChange={(e) => !verified && setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="eco-input"
            style={{ paddingLeft: "52px" }}
            disabled={verified || isOtpSent}
            required
          />
        </div>

        {!isOtpSent && !verified && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || phone.length !== 10}
            className="btn-primary"
            style={{
              padding: "13px 24px", minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center",
              opacity: (loading || phone.length !== 10) ? 0.6 : 1, transition: "all 0.2s"
            }}
          >
            {loading ? <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> : "Send OTP"}
          </button>
        )}

        {verified && (
          <span className="badge-available" style={{
            padding: "12px 20px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px",
            fontSize: "0.85rem", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)"
          }}>
            ✅ Verified
          </span>
        )}
      </div>

      {/* reCAPTCHA Invisible Element */}
      <div id="recaptcha-container"></div>

      {/* OTP inputs rendering */}
      {isOtpSent && !verified && (
        <div className="fade-in" style={{
          padding: "16px 20px", background: "rgba(13,31,60,0.6)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", display: "flex", flexDirection: "column", gap: "12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Enter 6-digit OTP code:</span>
            {timer > 0 ? (
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Resend OTP in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendAttempts >= 3}
                style={{
                  background: "none", border: "none", color: "#34d399", fontSize: "0.78rem", fontWeight: "600",
                  cursor: "pointer", textDecoration: "underline"
                }}
              >
                Resend OTP {resendAttempts > 0 && `(${3 - resendAttempts} left)`}
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpInputsRef.current[i] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                disabled={loading}
                style={{
                  width: "44px", height: "46px", textAlign: "center", fontSize: "1.2rem", fontWeight: "800",
                  background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", color: "#fff", outline: "none", transition: "all 0.2s"
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.background = "rgba(16,185,129,0.05)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
              />
            ))}
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#64748b" }}>
              <div className="spinner" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
              Verifying code...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PhoneVerification;
