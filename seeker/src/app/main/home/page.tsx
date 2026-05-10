import { signOut } from "@/auth"

export default function MainPage() {
    return (
        <main className="p-24">

            <div>
                <h1>ホーム画面</h1>
            </div>
            <div className="flex">
                <div>
                    <form
                        action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <button
                            type="submit"
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff4444",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            ログアウト
                        </button>
                    </form>
                </div>
                <div>
                    <p>aaaaaaa</p>
                </div>
            </div>
        </main>
       



        
    );
}


