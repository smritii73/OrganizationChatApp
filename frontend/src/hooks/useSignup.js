import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { SIGNUP_URL } from "../Url";


const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ fullName, username, email, password, confirmPassword, gender }) => {
		const success = handleInputErrors({ fullName, username, email, password, confirmPassword, gender });
		if (!success) return;

		console.log("hellow borther");

		setLoading(true);
		try {
			// http://localhost:5000 
			const res = await fetch(SIGNUP_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",

				body: JSON.stringify({ fullName, username, email, password, confirmPassword, gender }),
			});
			
			const data = await res.json();

			if (data.error) {
				throw new Error(data.error);
			}
			else{
				toast.success(data.message);
			}
			
			
			localStorage.setItem("chat-user", JSON.stringify(data));
			setAuthUser(data);
		} 
		
		catch (error) {
			
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};
export default useSignup;

function handleInputErrors({ fullName, username, email, password, confirmPassword, gender }) {
	if (!fullName || !username || !email || !password || !confirmPassword || !gender) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("Passwords do not match");
		return false;
	}

	if (password.length < 6) {
		toast.error("Password must be at least 6 characters");
		return false;
	}

	return true;
}