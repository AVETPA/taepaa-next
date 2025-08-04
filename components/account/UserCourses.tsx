import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function UserCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error("Not authenticated:", userError);
          return;
        }

        const { id: userId } = userData.user;

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("userId", userId)
          .order("completionDate", { ascending: false });

        if (error) throw error;

        setCourses(data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p>Loading your courses...</p>;
  if (courses.length === 0) return <p>No courses found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
      <ul className="space-y-4">
        {courses.map((course) => (
          <li key={course.id} className="border rounded p-4 shadow-sm">
            <p><strong>Course Name:</strong> {course.name || "N/A"}</p>
            <p><strong>Completion Date:</strong> {course.completionDate || "N/A"}</p>
            <p>
              <strong>Certificate:</strong>{" "}
              {course.certificateUrl ? (
                <a
                  href={course.certificateUrl}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              ) : (
                "Not available"
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
