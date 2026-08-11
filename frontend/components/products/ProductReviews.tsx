"use client";

import {
  Avatar,
  Divider,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

const reviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    comment: "Amazing product. Highly recommended!",
  },
  {
    id: 2,
    name: "Priya Patel",
    rating: 4,
    comment: "Good value for money. Delivery was fast.",
  },
  {
    id: 3,
    name: "Amit Kumar",
    rating: 5,
    comment: "Excellent quality and premium feel.",
  },
];

export default function ProductReviews() {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Customer Reviews
      </Typography>

      <Stack spacing={3}>
        {reviews.map((review) => (
          <div key={review.id}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar>{review.name.charAt(0)}</Avatar>

              <div>
                <Typography sx={{ fontWeight: 600 }}>
                  {review.name}
                </Typography>

                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                />
              </div>
            </Stack>

            <Typography sx={{ mt: 2 }}>
              {review.comment}
            </Typography>

            <Divider sx={{ mt: 3 }} />
          </div>
        ))}
      </Stack>
    </Paper>
  );
}