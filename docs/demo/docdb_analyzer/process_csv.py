import csv

# Open the input CSV file
with open('connectUsing.csv', 'r', newline='', encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    rows = list(reader)

# Replace the usernames in the last column with incrementing "some_user"
for i in range(1, len(rows)):  # Skip the header row
    rows[i][6] = f"some_user{i}"

# Write the modified data to a new CSV file
with open('connectUsing_modified.csv', 'w', newline='', encoding='utf-8') as output_file:
    writer = csv.writer(output_file)
    writer.writerows(rows)

print("CSV processing complete. Results saved to connectUsing_modified.csv") 