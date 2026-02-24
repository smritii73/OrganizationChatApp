import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { LOGOUT_URL } from "../Url";

const useLogout = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const logout = async () => {
		setLoading(true);
		try {
			const res = await fetch(LOGOUT_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials:"include",
			});
			const data = await res.json();
			
			if (data.error) {
				throw new Error(data.error);
			}
			else{
				toast.success(data.message);
			}

			localStorage.removeItem("chat-user");
			setAuthUser(null);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, logout };
};
export default useLogout;